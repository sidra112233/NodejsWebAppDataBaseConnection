INSERT INTO Student (student_name, password_hash, email)
VALUES 
('John Doe', 'hash_password1', 'john.doe@example.com'),
('Jane Smith', 'hash_password2', 'jane.smith@example.com');
INSERT INTO Courses ( course_name, category, difficulty, description, payment_status, payment_amount, payment_date, enrolled_students, start_date, duration)
VALUES 
('Introduction to Python', 'Programming', 'Beginner', 'Learn the basics of Python programming.', 'Paid', 49.99, '2023-01-01', 10, '2023-07-01', 30),
( 'Java for Beginners', 'Programming', 'Beginner', 'An introductory course to Java programming.', 'Paid', 59.99, '2023-01-01', 15, '2023-07-01', 45);
INSERT INTO Enrollments ( student_id, course_id, enrollment_date)
VALUES 
( 1, 1, '2023-07-01'),
( 2, 2, '2023-07-01');
-- Insert sample data into Modules table
-- Get the module_id for 'Getting Started with Python'
DECLARE @pythonModule1Id INT;
SELECT @pythonModule1Id = module_id FROM Modules WHERE course_id = course_id AND module_name = 'Getting Started with Python';

-- Insert Materials for 'Getting Started with Python'
INSERT INTO Materials (module_id, type, title, link, description)
VALUES
(@pythonModule1Id, 'Video', 'Python Setup Video Tutorial', 'http://example.com/python-setup-video', 'Video tutorial on how to set up Python environment'),
(@pythonModule1Id, 'Document', 'Python Installation Guide', 'http://example.com/python-installation-guide', 'Step-by-step guide to installing Python on various platforms');

-- Get the module_id for 'Python Data Types'
DECLARE @pythonModule2Id INT;
SELECT @pythonModule2Id = module_id FROM Modules WHERE course_id = course_id AND module_name = 'Python Data Types';

-- Insert Materials for 'Python Data Types'
INSERT INTO Materials (module_id, type, title, link, description)
VALUES
(@pythonModule2Id, 'Quiz', 'Python Variables and Data Types Quiz', 'http://example.com/python-variables-quiz', 'Quiz to test your understanding of Python variables and data types');

-- Get the module_id for 'Control Flow in Python'
DECLARE @pythonModule3Id INT;
SELECT @pythonModule3Id = module_id FROM Modules WHERE course_id = course_id AND module_name = 'Control Flow in Python';

-- Insert Materials for 'Control Flow in Python'
INSERT INTO Materials (module_id, type, title, link, description)
VALUES
(@pythonModule3Id, 'Document', 'Python Loops Explanation', 'http://example.com/python-loops-explanation', 'Detailed explanation of loops in Python');
DECLARE @pythonModule4Id INT;
SELECT @pythonModule4Id = module_id FROM Modules WHERE course_id = course_id AND module_name = 'Functions in Python';

-- Insert Materials for 'Functions in Python'
INSERT INTO Materials (module_id, type, title, link, description)
VALUES
(@pythonModule4Id, 'Document', 'Functions Explanation', 'https://www.youtube.com/watch?v=u-OmVr_fT4s', 'Detailed explanation of functions in Python');
-- Get the module_id for 'Introduction to Java'
DECLARE @javaModule1Id INT;
SELECT @javaModule1Id = module_id FROM Modules WHERE course_id = course_id AND module_name = 'Introduction to Java';

-- Insert Materials for 'Introduction to Java'
INSERT INTO Materials (module_id, type, title, link, description)
VALUES
(@javaModule1Id, 'Video', 'Java Introduction Video', 'http://example.com/java-introduction-video', 'Video introduction to Java programming language'),
(@javaModule1Id, 'Document', 'Java Basics Guide', 'http://example.com/java-basics-guide', 'Guide explaining basics of Java programming');

-- Get the module_id for 'Java Variables and Data Types'
DECLARE @javaModule2Id INT;
SELECT @javaModule2Id = module_id FROM Modules WHERE course_id = course_id AND module_name = 'Java Variables and Data Types';

-- Insert Materials for 'Java Variables and Data Types'
INSERT INTO Materials (module_id, type, title, link, description)
VALUES
(@javaModule2Id, 'Quiz', 'Java Variables Quiz', 'http://example.com/java-variables-quiz', 'Quiz to test your understanding of Java variables');

-- Get the module_id for 'Java Control Statements'
DECLARE @javaModule3Id INT;
SELECT @javaModule3Id = module_id FROM Modules WHERE course_id = course_id AND module_name = 'Java Control Statements';

-- Insert Materials for 'Java Control Statements'
INSERT INTO Materials (module_id, type, title, link, description)
VALUES
(@javaModule3Id, 'Document', 'Java Loops Explanation', 'http://example.com/java-loops-explanation', 'Explanation of loops and control statements in Java');

-- Insert values into Quizzes table
-- Assuming you have modules with IDs in the Modules table
-- Insert quizzes for each module

-- Get the module_id for 'Getting Started with Python'
DECLARE @pythonModule1Id INT;
SELECT @pythonModule1Id = module_id FROM Modules WHERE module_name = 'Getting Started with Python';

-- Insert quiz for 'Getting Started with Python'
INSERT INTO Quizzes (module_id, quiz_title, total_marks)
VALUES
(@pythonModule1Id, 'Python Basics Quiz', 20.0);

-- Get the module_id for 'Python Data Types'
DECLARE @pythonModule2Id INT;
SELECT @pythonModule2Id = module_id FROM Modules WHERE module_name = 'Python Data Types';

-- Insert quiz for 'Python Data Types'
INSERT INTO Quizzes (module_id, quiz_title, total_marks)
VALUES
(@pythonModule2Id, 'Python Variables Quiz', 25.0);

-- Get the module_id for 'Control Flow in Python'
DECLARE @pythonModule3Id INT;
SELECT @pythonModule3Id = module_id FROM Modules WHERE module_name = 'Control Flow in Python';

-- Insert quiz for 'Control Flow in Python'
INSERT INTO Quizzes (module_id, quiz_title, total_marks)
VALUES
(@pythonModule3Id, 'Python Control Flow Quiz', 30.0);

-- Get the course_id for 'Java for Beginners'
DECLARE @javaCourseId INT;
SELECT @javaCourseId = course_id FROM Courses WHERE course_name = 'Java for Beginners';

-- Get the module_id for 'Introduction to Java'
DECLARE @javaModule1Id INT;
SELECT @javaModule1Id = module_id FROM Modules WHERE course_id = @javaCourseId AND module_name = 'Introduction to Java';

-- Insert quiz for 'Introduction to Java'
INSERT INTO Quizzes (module_id, quiz_title, total_marks)
VALUES
(@javaModule1Id, 'Java Basics Quiz', 20.0);

-- Get the module_id for 'Java Variables and Data Types'
DECLARE @javaModule2Id INT;
SELECT @javaModule2Id = module_id FROM Modules WHERE course_id = @javaCourseId AND module_name = 'Java Variables and Data Types';

-- Insert quiz for 'Java Variables and Data Types'
INSERT INTO Quizzes (module_id, quiz_title, total_marks)
VALUES
(@javaModule2Id, 'Java Variables Quiz', 25.0);

-- Get the module_id for 'Java Control Statements'
DECLARE @javaModule3Id INT;
SELECT @javaModule3Id = module_id FROM Modules WHERE course_id = @javaCourseId AND module_name = 'Java Control Statements';

-- Insert quiz for 'Java Control Statements'
INSERT INTO Quizzes (module_id, quiz_title, total_marks)
VALUES
(@javaModule3Id, 'Java Control Flow Quiz', 30.0);

-- Assuming you have already inserted Courses for 'Introduction to Python' and 'Java for Beginners'

-- Insert Modules for 'Introduction to Python'
INSERT INTO Modules (course_id, module_name, description)
VALUES
(1, 'Getting Started with Python', 'Introduction to Python basics and setup'),
(1, 'Python Data Types', 'Learn about Python data types and variables'),
(1, 'Control Flow in Python', 'Learn how to use loops and conditional statements in Python'),
(1, 'Functions in Python', 'Learn how to use functions in Python');


-- Insert Modules for 'Java for Beginners'
INSERT INTO Modules (course_id, module_name, description)
VALUES
(2, 'Introduction to Java', 'Introduction to Java programming language'),
(2, 'Java Variables and Data Types', 'Learn about variables and data types in Java'),
(2, 'Java Control Statements', 'Learn how to use control statements in Java');

INSERT INTO QuizSubmissions (  score)
VALUES 
( 85.0),
( 90.0);
-- Insert a question for 'Python Basics Quiz'
INSERT INTO QuizQuestions (quiz_id, question_text, option1, option2, option3, option4, correct_option,explanation)
VALUES
(1, 'What is the output of print(2 + 3)?', '5', '6', '7', '8', 1, 
 'The `+` operator performs addition. `2 + 3` equals `5.'),

(1, 'Which of the following is used to denote a block of code in Python?', '{}', '[]', '()', 'Indentation', 4, 
 'In Python, blocks of code are denoted by indentation (whitespace) rather than braces or parentheses. `{}`, `[]`, and `()` are used for other purposes.'),

(1, 'All keywords in Python are in _________', 'lower case', 'UPPER CASE', 'Capitalized', 'None of the mentioned', 1, 
 'Python keywords are written in lower case. For example, `if`, `else`, and `while` are all lower case.'),

(1, 'What is the output of `print(2 ** 3)` in Python?', '5', '6', '8', '9', 3, 
 'The `**` operator is used for exponentiation. `2 ** 3` calculates 2 raised to the power of 3, which equals `8`.'),

(1, 'What is the result of `7 % 3` in Python?', '1', '2', '3', '0', 2, 
 'The `%` operator is used for modulus (remainder). `7 % 3` yields the remainder when 7 is divided by 3, which is `1`.'),

(1, 'Which operator is used for floor division in Python?', '//', '/', '**', '%', 1, 
 'The `//` operator is used for floor division in Python, which returns the largest integer less than or equal to the division result.');

(1, 'What is the output of `print(3 * \'Python\')?', 'PythonPythonPython', 'Python3Python3Python3', 'Python 3 Python 3 Python 3', 'Python', 1, 
 'The `*` operator with a string and an integer repeats the string. `3 * \'Python\'' results in `\'PythonPythonPython\'.'');

-- Insert a question for 'Python Variables Quiz'
INSERT INTO QuizQuestions (quiz_id, question_text, option1, option2, option3, option4, correct_option)
VALUES
(2, 'How do you declare a variable in Python?', 'variable_name = value', 'var variable_name = value', 'let variable_name = value', 'const variable_name = value', 1),
(2, 'Which of the following is an invalid variable?', 'my_string_1','1st_string','foo','_', 2),
(2, 'Why are local variable names beginning with an underscore discouraged?','they are used to indicate a private variables of a class',  'they confuse the interpreter',  'they are used to indicate global variables',  'they slow down execution', 1),
(2, 'Which of the following cannot be a variable?', '__init__',  'in',  'it',  'on',  2),
(2, 'Which of the following is true for variable names in Python?', 'unlimited length', 'all private members must have leading and trailing underscores', 'underscore and ampersand are the only two special characters allowed', 'none of the mentioned', 1),
(2, 'Which of the following is a valid variable name in Python?', '2variable', 'variable_2', 'variable@name', 'variable name', 2),
(2, 'What is the output of the following code? `print(type(5))`', '<class "int">', '<class "float">', '<class "str">', '<class "list">', 1),
(2, 'How do you assign a value to a variable in Python?', 'variable = 10', 'variable : 10', '10 -> variable', 'variable <- 10', 1),
(2, 'What will be the output of `print(x)` if `x` is defined as `x = 10`?', 'x', '10', 'None', 'Error', 2),
(2, 'What does a single underscore `_` typically represent in Python variable names?', 'It is used to indicate a global variable.', 'It is used to indicate a private variable of a class.', 'It is used to ignore certain values during unpacking.', 'It is used to indicate a constant variable.', 3);

-- Insert a question for 'Python Control Flow Quiz'
INSERT INTO QuizQuestions (quiz_id, question_text, option1, option2, option3, option4, correct_option,explanation)
VALUES
(3, 'Which of the following is used to create a loop in Python?', 'if', 'while', 'switch', 'return', 2, 
 'The `while` keyword is used to create a loop that continues as long as a condition is true. `if` is for conditional statements, `switch` is not used in Python, and `return` exits a function.'),

(3, 'What keyword is used to define a function in Python?', 'def', 'func', 'define', 'function', 1,
 'The `def` keyword is used to define a function in Python. Other options are not valid keywords for defining functions.'),

(3, 'What does the `break` statement do in a loop?', 'Continues to the next iteration', 'Exits the loop', 'Skips the rest of the code', 'None of the above', 2,
 'The `break` statement immediately exits the loop, skipping any remaining iterations.'),

(3, 'Which loop is guaranteed to execute at least once?', 'for', 'while', 'do-while', 'None of the above', 3,
 'The `do-while` loop is guaranteed to execute at least once because the condition is evaluated after the loop body executes. Note: Python does not have a `do-while` loop, but this is the typical behavior in other languages.'),

(3, 'How do you comment a single line in Python?', '# comment', '/* comment */', '// comment', '<!-- comment -->', 1,
 'In Python, single-line comments start with `#`. Other options are used in different programming languages.'),

(3, 'What will be the output of `print(2 ** 3)`?', '6', '8', '9', 'None of the above', 2,
 'The `**` operator is used for exponentiation in Python. `2 ** 3` calculates 2 raised to the power of 3, which is 8.'),

(3, 'How do you handle exceptions in Python?', 'try/except', 'handle/catch', 'error/resolve', 'except/try', 1,
 'Exceptions in Python are handled using `try` and `except` blocks. Other options do not exist in Python.'),

(3, 'What is the purpose of the `else` clause in a loop?', 'It executes when the loop is terminated by a `break` statement', 'It executes when the loop finishes without a `break`', 'It is used to handle errors', 'It skips the loop iteration', 2,
 'The `else` clause in a loop executes after the loop finishes normally, meaning without encountering a `break` statement.'),

(3, 'Which keyword is used to skip the current iteration of a loop?', 'continue', 'skip', 'pass', 'break', 1,
 'The `continue` keyword is used to skip the current iteration of a loop and continue with the next iteration. `pass` does nothing, `break` exits the loop, and `skip` is not a valid keyword.'),
(3, 'What is the output of `print(list(range(3)))`?', '[0, 1, 2]', '[1, 2, 3]', '[0, 1, 2, 3]', 'Error', 1,
 'The `range(3)` function generates numbers from 0 up to, but not including, 3. When converted to a list, it produces `[0, 1, 2]`.');
-- Insert a question for 'Java Basics Quiz'
INSERT INTO QuizQuestions (quiz_id, question_text, option1, option2, option3, option4, correct_option)
VALUES
(4, 'What is the default value of a boolean variable in Java?', 'true', 'false', 'null', '0', 2);

-- Insert a question for 'Java Variables Quiz'
INSERT INTO QuizQuestions (quiz_id, question_text, option1, option2, option3, option4, correct_option)
VALUES
(5, 'Which of the following is a valid variable name in Java?', 'int var_name', 'int 1var', 'int var-name', 'int varName', 4);

-- Insert a question for 'Java Control Flow Quiz'
INSERT INTO QuizQuestions (quiz_id, question_text, option1, option2, option3, option4, correct_option)
VALUES
(6, 'Which statement is used to exit a loop in Java?', 'continue', 'break', 'return', 'exit', 2);
INSERT INTO QuizAnswers (question_id, student_id, chosen_option, is_correct)
VALUES 
(1, 1, 3, 1),
(2, 1, 2, 1),
(3, 2, 3, 1),
(4, 2, 2, 1);
SELECT * FROM QuizSubmissions;
