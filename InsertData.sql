INSERT INTO Student (student_name, password_hash, email)
VALUES 
('John Doe', 'hash_password1', 'john.doe@example.com'),
('Jane Smith', 'hash_password2', 'jane.smith@example.com');

INSERT INTO Courses ( course_name, category, difficulty, description, payment_status, payment_amount, payment_date, enrolled_students, start_date, duration)
VALUES 
('Introduction to Python', 'Programming', 'Beginner', 'Learn the basics of Python programming.', 'Paid', 49.99, '2023-01-01', 10, '2023-07-01', 30),
( 'Java for Beginners', 'Programming', 'Beginner', 'An introductory course to Java programming.', 'Paid', 59.99, '2023-01-01', 15, '2023-07-01', 45);
INSERT INTO Enrollments (enrollment_id, student_id, course_id, enrollment_date)
VALUES 
(1, 1, 1, '2023-07-01'),
(2, 2, 2, '2023-07-01');
-- Insert sample data into Modules table
INSERT INTO Modules (module_name, description)
VALUES
    ( 'Introduction to SQL', 'This module covers basic SQL querying and database concepts.'),
    ( 'Advanced SQL Queries', 'Advanced SQL techniques including subqueries and joins.'),
    ( 'Python for Data Analysis', 'Using Python libraries like Pandas and NumPy for data analysis.');

INSERT INTO Materials ( type, title, link, description)
VALUES
    ( 'PDF', 'SQL Basics', 'https://example.com/sql_basics.pdf', 'Introduction to SQL fundamentals including data types, querying, and basic syntax.'),
    ( 'Video', 'SQL Querying Fundamentals', 'https://example.com/sql_fundamentals.mp4', 'Video lecture covering SQL querying techniques and best practices.');

-- Insert values into Quizzes table
INSERT INTO Quizzes (  quiz_title, total_marks)
VALUES
    ( 'Basic SQL Quiz', 100),
    (  'Advanced SQL Quiz', 150),
    (  'Python Quiz', 120);

INSERT INTO QuizSubmissions (  score)
VALUES 
( 85.0),
( 90.0);
INSERT INTO QuizQuestions ( question_text, option1, option2, option3, option4, correct_option, explanation)
VALUES 
( 'What is the output of print(2 + 3)?', '2', '3', '5', '23', 3, 'Addition operation'),
( 'Which of the following is a valid variable name in Python?', '1variable', 'variable1', 'var@1', '1_var', 2, 'Variable names should start with a letter or underscore.'),
( 'What is the output of System.out.println(2 + 3);?', '2', '3', '5', '23', 3, 'Addition operation in Java'),
( 'Which of the following is a valid variable name in Java?', '1variable', 'variable1', 'var@1', '1_var', 2, 'Variable names should start with a letter or underscore.');
INSERT INTO QuizAnswers (question_id, student_id, chosen_option, is_correct)
VALUES 
(1, 1, 3, 1),
(2, 1, 2, 1),
(3, 2, 3, 1),
(4, 2, 2, 1);
SELECT * FROM QuizSubmissions;