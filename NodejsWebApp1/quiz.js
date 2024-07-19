const sql = require('mssql');
let readline = require('readline');


const config = {
    server: 'DESKTOP-5NP2PDK\\MSSQLSERVER2022',          // Your server name or IP address
    database: 'LearnCodePro',// Your database name
    user: 'Sidra',
    password: 'Sidra',
    options: {
        encrypt: true,             // Use encryption
        trustServerCertificate: true // Trust the server certificate
    }
};
async function getMaxIds(pool) {
    try {
        const query = `
            SELECT 
                ISNULL(MAX(student_id), 0) as maxStudentId,
                ISNULL(MAX(quiz_id), 0) as maxQuizId
            FROM QuizSubmissions;
        `;

        const result = await pool.request().query(query);

        return {
            maxStudentId: result.recordset[0].maxStudentId,
            maxQuizId: result.recordset[0].maxQuizId
        };

    } catch (err) {
        console.error('Error retrieving max IDs:', err.message);
        return {
            maxStudentId: 0,
            maxQuizId: 0
        };
    }
}
async function askQuestion(rl, question) {
    return new Promise(resolve => {
        rl.question(question, answer => {
            resolve(answer);
        });
    });
}
async function QuizSubmissions(quiz_id, student_id, score, pool) {
    try {
        // Check if the student_id exists in the Student table before inserting
        const checkQuery = `
            SELECT COUNT(*) as studentCount
            FROM Student
            WHERE student_id = @student_id;
        `;

        const checkRequest = pool.request();
        checkRequest.input('student_id', sql.Int, student_id);

        const checkResult = await checkRequest.query(checkQuery);
        const studentExists = checkResult.recordset[0].studentCount > 0;

        if (!studentExists) {
            console.error(`Error saving score: Student with ID ${student_id} does not exist.`);
            return;
        }

        // Proceed with inserting into QuizSubmissions
        const query = `
            INSERT INTO QuizSubmissions (quiz_id, student_id, score)
            VALUES (@quiz_id, @student_id, @score);
        `;

        const request = pool.request();
        request.input('quiz_id', sql.Int, quiz_id);
        request.input('student_id', sql.Int, student_id);
        request.input('score', sql.Float, score);

        await request.query(query);

        console.log('Score saved successfully.');

    } catch (err) {
        console.error('Error saving score:', err.message);
    }
}

async function main() {
    let pool;
    let quiz_id, student_id;
    let scores = []; // Array to store scores during the quiz

    try {
        // Connect to MSSQL
        pool = await sql.connect(config);

        // Fetch current maximum student_id and quiz_id
        const maxIds = await getMaxIds(pool);
        student_id = maxIds.maxStudentId + 1;
        quiz_id = maxIds.maxQuizId + 1;

        console.log(`Starting quiz for student ID: ${student_id} and Quiz ID: ${quiz_id}`);

        // Initialize readline interface
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // Start quiz loop
        let offset = 0;

        while (true) {
            // Fetch question and options from database
            const query = `
                SELECT question_id, question_text, option1, option2, option3, option4, correct_option
                FROM QuizQuestions
                ORDER BY question_id
                OFFSET @offset ROWS FETCH NEXT 1 ROWS ONLY;
            `;

            const request = pool.request();
            request.input('offset', sql.Int, offset);

            const result = await request.query(query);

            // Check if there are no more questions
            if (result.recordset.length === 0) {
                console.log('No more questions. Quiz completed!');
                break;
            }

            // Extract question details from result
            const question = result.recordset[0];

            // Display question and options
            console.log(`Question ${offset + 1}: ${question.question_text}\n`);
            console.log(`Options:`);
            console.log(`1. ${question.option1}`);
            console.log(`2. ${question.option2}`);
            console.log(`3. ${question.option3}`);
            console.log(`4. ${question.option4}`);
            console.log();

            // Prompt user for input
            const userInput = await askQuestion(rl, 'Your choice (enter option number): ');

            // Validate user input
            const selectedOptionId = parseInt(userInput);
            if (isNaN(selectedOptionId) || selectedOptionId < 1 || selectedOptionId > 4) {
                console.log('Invalid option. Please choose a valid option.\n');
                continue;
            }

            // Check user's answer
            const correctOptionId = question.correct_option;
            const isCorrect = selectedOptionId === correctOptionId;
            if (!isCorrect) {
                console.log(`Incorrect! Correct option: ${correctOptionId}. ${question[`option${correctOptionId}`]}\n`);
            }
            else
                console.log('Correct Answer!');
            const score = selectedOptionId === correctOptionId ? 10 : 0; // Example: Score logic based on correct answer

            // Store the score
            scores.push(score);

            // Move to the next question by incrementing the offset
            offset++;
        }

        // Calculate total score
        const totalScore = scores.reduce((acc, cur) => acc + cur, 0);

        // Save quiz score
        await QuizSubmissions(quiz_id, student_id, totalScore, pool);

        console.log(`Total Score: ${totalScore}`);

        rl.close();

    } catch (err) {
        console.error('Error:', err.message);
    } 
}

async function getTotalScore(student_id, quiz_id, pool) {
    try {
        const query = `
            SELECT SUM(score) as total_score
            FROM QuizSubmissions
            WHERE student_id = @student_id AND quiz_id = @quiz_id;
        `;

        const request = pool.request();
        request.input('student_id', sql.Int, student_id);
        request.input('quiz_id', sql.Int, quiz_id);

        const result = await request.query(query);

        return result.recordset[0].total_score || 0;

    } catch (err) {
        console.error('Error retrieving total score:', err.message);
        return 0;
    }
}

main();
