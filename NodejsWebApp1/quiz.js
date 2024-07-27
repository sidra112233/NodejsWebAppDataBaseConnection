const express = require('express');
const session = require('express-session');
const sql = require('mssql');
const app = express();

const dbConfig = {
    server: 'DESKTOP-5NP2PDK\\MSSQLSERVER2022',          // Your server name or IP address
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

    res.render('quiz', {
        student_id: req.session.student_id,
        quiz_id: req.session.quiz_id,
        questions,
        currentQuestionIndex,
        totalQuestions
    });
});

app.post('/next', async (req, res) => {
    const { action, answers } = req.body;
    const student_id = req.session.student_id;
    const quiz_id = req.session.quiz_id;
    const questions = await getQuestionsFromDatabase();
    const totalQuestions = questions.length;
    let currentQuestionIndex = req.session.currentQuestionIndex || 0;

    if (!req.session.scores) {
        req.session.scores = [];
    }

    // Check if an answer was provided for the current question
    if (answers) {
        const questionId = questions[currentQuestionIndex].question_id;
        const selectedOption = parseInt(answers[questionId]);
        const correctOption = questions[currentQuestionIndex].correct_option;

        // Add or subtract points based on whether the answer was correct or not
        const score = selectedOption === correctOption ? 10 : -10; // 10 points for correct, -10 for incorrect
        req.session.scores[currentQuestionIndex] = score;
    }

    // Increment the question index if the action is 'next'
    if (action === 'next') {
        currentQuestionIndex++;
        req.session.currentQuestionIndex = currentQuestionIndex;
    }

    // If the quiz is complete or submit button is clicked
    if (action === 'submit' || currentQuestionIndex >= totalQuestions) {
        const totalScore = req.session.scores.reduce((acc, cur) => acc + cur, 0);
        await saveQuizSubmission(student_id, quiz_id, totalScore);

        // Clear session data for a new quiz
        req.session.destroy();

        return res.render('result', { totalScore });
    }

    res.render('quiz', {
        student_id,
        quiz_id,
        questions,
        currentQuestionIndex,
        totalQuestions
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
