const express = require('express');
const session = require('express-session');
const sql = require('mssql');
const app = express();

const dbConfig = {
    server: 'DESKTOP-O5M8LH7\\SQLEXPRESS',          // Your server name or IP address
    database: 'LearnCodePro',// Your database name
    driver: 'msnodesqlv8',
    user: 'Sidra',
    password: 'Sidra',
    options: {
        encrypt: true,             // Use encryption
        trustServerCertificate: true // Trust the server certificate
    }
};

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'Sidra',
    resave: false,
    saveUninitialized: true
}));
// Define quiz parameters
const quizParams = {
    timeLimit: 30, // in minutes
    numberOfQuestions: 10,
    pointsToScore: 100,
    passingScore: 50
};

// Route for the start page
app.get('/start', (req, res) => {
    res.render('start', quizParams);
});
async function getNextStudentId() {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT ISNULL(MAX(student_id), 0) + 1 as nextStudentId FROM QuizSubmissions');
    return result.recordset[0].nextStudentId;
}

async function getNextQuizId() {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT ISNULL(MAX(quiz_id), 0) + 1 as nextQuizId FROM QuizSubmissions');
    return result.recordset[0].nextQuizId;
}
app.get('/quiz', async (req, res) => {
    const questions = await getQuestionsFromDatabase();
    const totalQuestions = questions.length;
    const currentQuestionIndex = req.session.currentQuestionIndex || 0;

    if (!req.session.student_id) {
        req.session.student_id = await getNextStudentId();
    }
    if (!req.session.quiz_id) {
        req.session.quiz_id = await getNextQuizId();
    }

    // Initialize start time if not already set
    if (!req.session.startTime) {
        req.session.startTime = new Date().getTime();
    }

    // Calculate elapsed time and remaining time
    const currentTime = new Date().getTime();
    const elapsedTime = (currentTime - req.session.startTime) / 1000; // Time in seconds
    const timeLimitInSeconds = quizParams.timeLimit * 60; // Convert minutes to seconds
    const timeLeft = Math.max(0, timeLimitInSeconds - elapsedTime); // Time left in seconds

    res.render('quiz', {
        student_id: req.session.student_id,
        quiz_id: req.session.quiz_id,
        questions,
        currentQuestionIndex,
        totalQuestions,
        timeLimit: quizParams.timeLimit,
        timeLeft // Pass the remaining time to the template
    });
});

app.post('/next', async (req, res) => {
    const { action, answers, currentQuestionId } = req.body;
    const student_id = req.session.student_id;
    const quiz_id = req.session.quiz_id;
    const questions = await getQuestionsFromDatabase();
    const totalQuestions = questions.length;
    let currentQuestionIndex = req.session.currentQuestionIndex || 0;

    if (!req.session.scores) {
        req.session.scores = [];
    }

    // Check if the quiz has timed out
    const currentTime = new Date().getTime();
    const startTime = req.session.startTime;
    const elapsedTime = (currentTime - startTime) / 1000; // Time in seconds
    const timeLimitInSeconds = quizParams.timeLimit * 60; // Total quiz time in seconds
    if (elapsedTime > timeLimitInSeconds) {
        // Time limit exceeded
        req.session.destroy(); // Clear session data
        return res.render('result', { totalScore: req.session.scores.reduce((acc, cur) => acc + cur, 0), timeExpired: true });
    }

    // Log incoming data for debugging
    console.log('Incoming data:', req.body);

    // Check if an answer was provided
    if (answers && currentQuestionId) {
        const answersObj = Array.isArray(answers) ? { [currentQuestionId]: answers[0] } : answers;

        const selectedOptionId = parseInt(answersObj[currentQuestionId], 10); // Convert to integer
        const currentQuestion = questions.find(q => q.question_id == currentQuestionId);
        const correctOptionId = currentQuestion.correct_option;

        // Validate and calculate score
        if (!isNaN(selectedOptionId)) {
            const score = selectedOptionId === correctOptionId ? 10 : 0;
            req.session.scores[currentQuestionIndex] = score;
        }
    }

    // Increment the question index if the action is 'next'
    if (action === 'next') {
        currentQuestionIndex++;
        req.session.currentQuestionIndex = currentQuestionIndex;
    }

    // If the quiz is complete or submit button is clicked
    if (action === 'submit' || currentQuestionIndex >= totalQuestions) {
        req.session.scores = req.session.scores || [];
        const totalScore = req.session.scores.reduce((acc, cur) => acc + cur, 0);

        await saveQuizSubmission(student_id, quiz_id, totalScore);

        req.session.destroy(); // Clear session data
        return res.render('result', { totalScore });
    }

    // Render the next question
    res.render('quiz', {
        student_id,
        quiz_id,
        questions,
        currentQuestionIndex,
        totalQuestions,
        timeLimit: quizParams.timeLimit,
        timeLeft: Math.max(0, Math.round(timeLimitInSeconds - elapsedTime)) // Time left in seconds
    });
});




async function getQuestionsFromDatabase() {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT * FROM QuizQuestions');
    return result.recordset.map(question => ({
        question_id: question.question_id,
        question_text: question.question_text,
        options: [question.option1, question.option2, question.option3, question.option4],
        correct_option: question.correct_option
    }));
}

async function saveQuizSubmission(student_id, quiz_id, totalScore) {
    try {
        const pool = await sql.connect(dbConfig);
        const query = `
            INSERT INTO QuizSubmissions (student_id, quiz_id, score)
            VALUES (@student_id, @quiz_id, @score);
        `;

        await pool.request()
            .input('student_id', sql.Int, student_id)
            .input('quiz_id', sql.Int, quiz_id)
            .input('score', sql.Float, totalScore)
            .query(query);

        console.log('Score saved successfully.');
    } catch (err) {
        console.error('Error saving score:', err.message);
    }
}

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});