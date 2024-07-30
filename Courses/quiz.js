const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('./config'); // Ensure this is the correct path

// Route to show quiz start page
router.get('/start/:quizId', async (req, res) => {
    const quizId = req.params.quizId;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('quizId', sql.Int, quizId)
            .query('SELECT * FROM Quizzes WHERE quiz_id = @quizId');

        if (result.recordset.length === 0) {
            return res.status(404).send('Quiz not found');
        }

        const quiz = result.recordset[0];
        res.render('quizStart', {
            quizTitle: quiz.quiz_title,
            timeLimit: quiz.time_limit,
            numberOfQuestions: quiz.number_of_questions,
            pointsToScore: quiz.points_to_score,
            passingScore: quiz.passing_score,
            quizId: quiz.quiz_id
        });
    } catch (err) {
        console.error('Error fetching quiz details:', err.message);
        res.status(500).send('Error fetching quiz details');
    }
});

// Route to start quiz and show questions
router.post('/start', async (req, res) => {
    const quizId = parseInt(req.body.quiz_id, 10);
    if (!quizId) {
        return res.status(400).send('Quiz ID is required');
    }

    try {
        // Store quiz ID in session
        req.session.quiz_id = quizId;
        req.session.currentQuestionIndex = 0;
        req.session.startTime = new Date().getTime();

        // Redirect to the quiz page
        res.redirect('/quiz');
    } catch (err) {
        console.error('Error starting quiz:', err.message);
        res.status(500).send('Error starting quiz');
    }
});

// Route to fetch questions and display quiz
router.get('/', async (req, res) => {
    if (!req.session.quiz_id) {
        return res.redirect('/'); // Redirect to home if no quiz ID
    }

    const quizId = req.session.quiz_id;
    try {
        const pool = await sql.connect(config);

        // Fetch questions for the quiz
        const questionsResult = await pool.request()
            .input('quizId', sql.Int, quizId)
            .query('SELECT * FROM QuizQuestions WHERE quiz_id = @quizId');

        const questions = questionsResult.recordset;

        // Render quiz page
        res.render('quiz', {
            questions,
            quizId: req.session.quiz_id,
            currentQuestionIndex: req.session.currentQuestionIndex,
            totalQuestions: questions.length,
            timeLimit: 30 // Example, should be retrieved dynamically
        });
    } catch (err) {
        console.error('Error fetching quiz questions:', err.message);
        res.status(500).send('Error fetching quiz questions');
    }
});

module.exports = router;
