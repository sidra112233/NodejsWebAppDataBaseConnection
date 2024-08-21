INSERT INTO Student (student_name, password_hash, email)
VALUES 
('John Doe', 'hash_password1', 'john.doe@example.com'),
('Jane Smith', 'hash_password2', 'jane.smith@example.com');
INSERT INTO Courses ( course_name, category, difficulty, description, enrolled_students)
VALUES 
('Introduction to Python', 'Programming', 'Beginner', 'Learn the basics of Python', 30),
( 'Java for Beginners', 'Programming', 'Beginner', 'Learn the basics of Java', 45);
INSERT INTO Enrollments ( student_id, course_id, enrollment_date)
VALUES 
( 1, 1, '2023-07-01'),
( 2, 2, '2023-07-01');
-- Insert sample data into Modules table

-- Insert Modules for 'Introduction to Python'
INSERT INTO Modules (course_id, module_name, description)
VALUES
(1, 'Getting Started with Python', 'This section will help you get started with Python Programming language by installing it and running your first program. Also, it will walk you through the basic concepts and fundamentals of Python.'),
(1, 'Python Variables and Data Types', 'Learn how to create, modify, delete variables of different types. Learn to use some basic numeric (int, float, and complex), string, and Boolean types that are built into Python. For example, we can create a variable with a specific name. Once you create a variable, you can later call up its value by typing the variable name.'),
(1, 'Control Flow and Loops in Python', 'In Python, flow control is the order in which statements or blocks of code are executed at runtime based on a condition. The loop statement repeats a code block a number of times. Learn to use loops, conditional statements, iterative statements, and transfer statements.'),
(1,'Python Input and Output','This section lets you know input and output in Python. Learn to get input from the user, files, and display output on the screen or console. Also, learn output formatting.'),
(1, 'Functions in Python', 'In Python, the function is a block of code defined with a name. We use functions whenever we need to perform the same task multiple times without writing the same code again. It can take arguments and returns the value.');

-- Insert Modules for 'Java for Beginners'
INSERT INTO Modules (course_id, module_name, description)
VALUES
(2, 'Introduction to Java', 'In this module, we will introduce you to Java, examine the benefits of Java, and the ways in which Java is packaged. 
 We will see how Java can be installed, and we will demo Hello World in Java. '),
(2, 'Java Variables and Data Types', 'Java Variables
Variables are containers for storing data values.
In Java, there are different types of variables, for example:
String - stores text, such as "Hello". String values are surrounded by double quotes
int - stores integers (whole numbers), without decimals, such as 123 or -123
float - stores floating point numbers, with decimals, such as 19.99 or -19.99
char - stores single characters. Char values are surrounded by single quotes
boolean - stores values with two states: true or false.
Data types are divided into two groups:
Primitive data types - includes byte, short, int, long, float, double, boolean and char
Non-primitive data types - such as String, Arrays and Classes (you will learn more about these in a later chapter)'),
(2, 'Java Control Statements', 'Java compiler executes the code from top to bottom. The statements in the code are executed according to the order in which they appear. However, Java provides statements that can be used to control the flow of Java code. Such statements are called control flow statements. It is one of the fundamental features of Java, which provides a smooth flow of program.
Java provides three types of control flow statements.
Decision Making statements
if statements
switch statement
Loop statements
do while loop
while loop
for loop
for-each loop
Jump statements
break statement
continue statement');
-- Get the module_id for 'Getting Started with Python'
DECLARE @pythonModule1Id INT;
SELECT @pythonModule1Id = module_id 
FROM Modules 
WHERE course_id = 1 
AND module_name = 'Getting Started with Python';

-- Insert Materials for 'Getting Started with Python'
INSERT INTO Materials (module_id, type, title, link, description)
VALUES
(@pythonModule1Id, 'Video', 'Python Setup Video Tutorial', 'https://www.youtube.com/watch?v=YYXdXT2l-Gg', 'Video tutorial on how to set up Python environment'),
(@pythonModule1Id, 'Document', 'Python Installation Guide', 'https://www.linkedin.com/pulse/how-install-python-step-by-step-guide-azhar-khan-l2jyf', 'Step-by-step guide to installing Python on various platforms'),
(@pythonModule1Id, 'Video', 'Get started with python', 'https://www.youtube.com/watch?v=XIR20HH8mNY', 'Guide to using Python IDLE to run code interactively'),
(@pythonModule1Id, 'Video', 'Python Statements', 'https://www.youtube.com/watch?v=Zp5MuPOtsSY', 'Video on Python syntax and indentation'),
(@pythonModule1Id, 'Video', 'Python Comments', 'http://example.com/python-statements', 'Detailed explanation of simple and compound Python statements'),
(@pythonModule1Id, 'Video', 'Using Comments in Python', 'https://www.youtube.com/watch?v=VcPe_xY5gMk', 'Guide on using inline, block, and multi-line comments in Python code'),
(@pythonModule1Id, 'Video', 'List of Python Keywords', 'https://www.youtube.com/watch?v=UIFhLzyxU_I', 'List of reserved words in Python and their usage'),
(@pythonModule1Id, 'Video', 'Guide to Python Operators', 'https://www.youtube.com/watch?v=3HKdkws6YxQ', 'Guide to using mathematical, logical, and boolean operators in Python');

-- Get the module_id for 'Python Variables and Data Types'
DECLARE @pythonModule2Id INT;
SELECT @pythonModule2Id = module_id 
FROM Modules 
WHERE course_id = 1 
AND module_name = 'Python Variables and Data Types';

-- Insert Materials for 'Python Variables and Data Types'
INSERT INTO Materials (module_id, type, title, link, description)
VALUES
(@pythonModule2Id, 'Video', 'Python Variables', 'https://www.youtube.com/watch?v=o-pRdr8IMWg', 'A variable is a reserved memory area (memory address) to store value.'),
(@pythonModule2Id, 'Video', 'Python Data Types', 'https://www.youtube.com/watch?v=JXQ_lFGM0bg', 'Data types specify the different sizes and values that can be stored in the variable.'),
(@pythonModule2Id, 'Video', 'Python Casting (Type Conversion)', 'https://www.youtube.com/watch?v=c98KSQXQopI&t=85s', 'Learn type conversion and typecasting. Convert variable declared in specific data type to different data types.'),
(@pythonModule2Id, 'Video', 'Python Number', 'https://www.youtube.com/watch?v=Ca1NYpE3QWg', 'Learn to work with numerical data in Python. Learn numerical data types. Also learn Math module, Decimal, and Fraction modules.');

-- Get the module_id for 'Control Flow and Loops in Python'
DECLARE @pythonModule3Id INT;
SELECT @pythonModule3Id = module_id 
FROM Modules 
WHERE course_id = 1 
AND module_name = 'Control Flow and Loops in Python';

-- Insert Materials for 'Control Flow and Loops in Python'
INSERT INTO Materials (module_id, type, title, link, description)
VALUES
(@pythonModule3Id, 'Video', 'Control Flow Statements', 'https://www.youtube.com/watch?v=Zp5MuPOtsSY&t=3s', 'Use the if-else statements in Python for conditional decision-making.'),
(@pythonModule3Id, 'Video', 'Python for loop', 'https://www.youtube.com/watch?v=94UHCEmprCY', 'To iterate over a sequence of elements such as list, string.'),
(@pythonModule3Id, 'Video', 'Python range() function', 'https://www.youtube.com/watch?v=CQMivFU8vHo', 'Using a for loop with range(), we can repeat an action a specific number of times.'),
(@pythonModule3Id, 'Video', 'Python while loop', 'https://www.youtube.com/watch?v=ECduJk00mUU', 'To repeat a block of code repeatedly, as long as the condition is true.'),
(@pythonModule3Id, 'Video', 'Break and Continue', 'https://www.youtube.com/watch?v=BTaPo33TBIM', 'To alter the loop’s execution in a certain manner.'),
(@pythonModule3Id, 'Video', 'Nested loop', 'https://www.youtube.com/watch?v=shO5VbD2rNI', 'A loop inside a loop is known as a nested loop.'),
(@pythonModule3Id, 'Video', 'Print pattern in Python', 'https://www.youtube.com/watch?v=nFEj5mhq6xQ', 'Learn to use loops to print number and pyramid pattern.');
-- Get the module_id for 'Python Input and Output'
DECLARE @pythonModule4Id INT;
SELECT @pythonModule4Id = module_id FROM Modules 
WHERE course_id = 1 
AND module_name = 'Python Input and Output';

-- Insert Materials for 'Python Input and Output'
INSERT INTO Materials (module_id, type, title, link, description)
VALUES
(@pythonModule4Id, 'Video', 'Python Input and Output', 'https://www.youtube.com/watch?v=Cc3DPUs8oMk', 'This section lets you know input and output in Python. Learn to get input from the user, files, and display output on the screen or console. Also, learn output formatting.'),
(@pythonModule4Id, 'Video', 'Python Input and Output', 'https://www.youtube.com/watch?v=DB9Cq6TSTuQ', 'Use the input() function, to take input from a user, and the print() function, to display output on the screen.'),
(@pythonModule4Id, 'Video', 'Check if User Input is a Number or String', 'https://www.youtube.com/watch?v=5W2EESdJQ5I', 'Learn how to check if user input is a number or a string.'),
(@pythonModule4Id, 'Video', 'Take a List as Input from a User', 'https://www.youtube.com/watch?v=DY_MrKjURQk', 'Learn how to take a list as an input from a user.');

-- Get the module_id for 'Functions in Python'
DECLARE @pythonModule5Id INT;
SELECT @pythonModule5Id = module_id 
FROM Modules 
WHERE course_id = 1 
AND module_name = 'Functions in Python';

-- Insert Materials for 'Functions in Python'
INSERT INTO Materials (module_id, type, title, link, description)
VALUES
(@pythonModule5Id, 'Video', ' Python Functions', 'https://www.youtube.com/watch?v=u-OmVr_fT4s', 'In Python, the function is a block of code defined with a name.
We use functions whenever we need to perform the same task multiple times without writing the same code again. It can take arguments and returns the value.');
-- Get the module_id for 'Introduction to Java'
DECLARE @javaModule1Id INT;
SELECT @javaModule1Id = module_id FROM Modules WHERE course_id = 2 AND module_name = 'Introduction to Java';

-- Insert Materials for 'Introduction to Java'
INSERT INTO Materials (module_id, type, title, link, description)
VALUES
(@javaModule1Id, 'Video', 'Java Introduction Video', 'https://www.youtube.com/watch?v=krGadRGdESQ', 'Video introduction to Java programming language'),
(@javaModule1Id, 'Document', 'Java Basics Guide', 'https://www.java.com/en/download/help/download_options.html', 'Guide explaining basics of Java programming');

-- Declare and set the variable for 'Java Variables and Data Types' module_id
DECLARE @javaModule2Id INT;
SELECT @javaModule2Id = module_id FROM Modules WHERE course_id = 2 AND module_name = 'Java Variables and Data Types';

-- Insert Materials for 'Java Variables and Data Types'
INSERT INTO Materials (module_id, type, title, link, description)
VALUES
(@javaModule2Id, 'Video', 'Java Variables and datatypes explanation', 'https://www.youtube.com/watch?v=AsW84fA4Nb8', 'Variables are containers for storing data values.');

-- Declare and set the variable for 'Java Control Statements' module_id
DECLARE @javaModule3Id INT;
SELECT @javaModule3Id = module_id FROM Modules WHERE course_id = 2 AND module_name = 'Java Control Statements';

-- Insert Materials for 'Java Control Statements'
INSERT INTO Materials (module_id, type, title, link, description)
VALUES
(@javaModule3Id, 'Video', 'Java Loops Explanation', 'https://www.youtube.com/watch?v=Rn16ugyorX0', 'Explanation of loops and control statements in Java.');

-- Insert values into Quizzes table
-- Assuming you have modules with IDs in the Modules table
-- Insert quizzes for each module
-- Loop through the Python modules and insert quizzes

DECLARE @pythonModule1Id INT;
SELECT @pythonModule1Id = module_id FROM Modules WHERE course_id = 1 AND module_name = 'Getting Started with Python';

INSERT INTO Quizzes (module_id, quiz_title, total_marks)
VALUES
(@pythonModule1Id, 'Python Basics Quiz', 20.0);


DECLARE @pythonModule2Id INT;
SELECT @pythonModule2Id = module_id FROM Modules WHERE course_id = 1 AND module_name = 'Python Variables and Data Types';

INSERT INTO Quizzes (module_id, quiz_title, total_marks)
VALUES
(@pythonModule2Id, 'Python Variables Quiz', 25.0);


DECLARE @pythonModule3Id INT;
SELECT @pythonModule3Id = module_id FROM Modules WHERE course_id = 1 AND module_name = 'Control Flow and Loops in Python';

INSERT INTO Quizzes (module_id, quiz_title, total_marks)
VALUES
(@pythonModule3Id, 'Python Control Flow Quiz', 30.0);


DECLARE @pythonModule4Id INT;
SELECT @pythonModule4Id = module_id FROM Modules WHERE course_id = 1 AND module_name = 'Python Input and Output';

INSERT INTO Quizzes (module_id, quiz_title, total_marks)
VALUES
(@pythonModule4Id, 'Python Input/Output Quiz', 20.0);


DECLARE @pythonModule5Id INT;
SELECT @pythonModule5Id = module_id FROM Modules WHERE course_id = 1 AND module_name = 'Functions in Python';

INSERT INTO Quizzes (module_id, quiz_title, total_marks)
VALUES
(@pythonModule5Id, 'Python Functions Quiz', 25.0);
-- Loop through the Java modules and insert quizzes

DECLARE @javaModule1Id INT;
SELECT @javaModule1Id = module_id FROM Modules WHERE course_id = 2 AND module_name = 'Introduction to Java';

INSERT INTO Quizzes (module_id, quiz_title, total_marks)
VALUES
(@javaModule1Id, 'Java Basics Quiz', 20.0);


DECLARE @javaModule2Id INT;
SELECT @javaModule2Id = module_id FROM Modules WHERE course_id = 2 AND module_name = 'Java Variables and Data Types';

INSERT INTO Quizzes (module_id, quiz_title, total_marks)
VALUES
(@javaModule2Id, 'Java Variables and data types Quiz', 25.0);


DECLARE @javaModule3Id INT;
SELECT @javaModule3Id = module_id FROM Modules WHERE course_id = 2 AND module_name = 'Java Control Statements';

INSERT INTO Quizzes (module_id, quiz_title, total_marks)
VALUES
(@javaModule3Id, 'Java Control Flow Quiz', 30.0);

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
-- Insert questions for 'Python Input/Output Quiz'
INSERT INTO QuizQuestions (quiz_id, question_text, option1, option2, option3, option4,correct_option)
VALUES
(4, 'Which function is used to take input from the user?', 'raw_input()', 'input()', 'scanf()', 'cin',2),
(4, 'Which function is used to display output?', 'write()', 'output()', 'display()', 'print()', 4);
-- Insert questions for 'Python Functions Quiz'
INSERT INTO QuizQuestions (quiz_id, question_text, option1, option2, option3, option4,correct_option)
VALUES
(5, 'Which keyword is used to define a function?', 'function', 'define', 'def', 'fn', 3),
(5, 'What is the output of: def add(a, b): return a + b; print(add(2, 3))?', '23', '5', 'Error', 'None', 2);

-- Insert a question for 'Java Basics Quiz'
INSERT INTO QuizQuestions (quiz_id, question_text, option1, option2, option3, option4, correct_option)
VALUES
(6, 'What is the default value of a boolean variable in Java?', 'true', 'false', 'null', '0', 2);

-- Insert a question for 'Java Variables Quiz'
INSERT INTO QuizQuestions (quiz_id, question_text, option1, option2, option3, option4, correct_option)
VALUES
(7, 'Which of the following is a valid variable name in Java?', 'int var_name', 'int 1var', 'int var-name', 'int varName', 4);

-- Insert a question for 'Java Control Flow Quiz'
INSERT INTO QuizQuestions (quiz_id, question_text, option1, option2, option3, option4, correct_option)
VALUES
(8, 'Which statement is used to exit a loop in Java?', 'continue', 'break', 'return', 'exit', 2);
INSERT INTO QuizAnswers (question_id, student_id, chosen_option, is_correct)
VALUES 
(1, 1, 3, 1),
(2, 1, 2, 1),
(3, 2, 3, 1),
(4, 2, 2, 1);
-- Declare module IDs for Python course
DECLARE @pythonModule1Id INT;
DECLARE @pythonModule2Id INT;
DECLARE @pythonModule3Id INT;
DECLARE @pythonModule4Id INT;
DECLARE @pythonModule5Id INT;

-- Get the module_id for 'Getting Started with Python'
SELECT @pythonModule1Id = module_id 
FROM Modules 
WHERE course_id = 1 
AND module_name = 'Getting Started with Python';

-- Get the module_id for 'Python Variables and Data Types'
SELECT @pythonModule2Id = module_id 
FROM Modules 
WHERE course_id = 1 
AND module_name = 'Python Variables and Data Types';

-- Get the module_id for 'Control Flow and Loops in Python'
SELECT @pythonModule3Id = module_id 
FROM Modules 
WHERE course_id = 1 
AND module_name = 'Control Flow and Loops in Python';

-- Get the module_id for 'Python Input and Output'
SELECT @pythonModule4Id = module_id 
FROM Modules 
WHERE course_id = 1 
AND module_name = 'Python Input and Output';

-- Get the module_id for 'Functions in Python'
SELECT @pythonModule5Id = module_id 
FROM Modules 
WHERE course_id = 1 
AND module_name = 'Functions in Python';
-- Insert exercises for Python modules
INSERT INTO Exercises (module_id, question_text, code_snippet, correct_answers, feedback_correct, feedback_incorrect)
VALUES 
(@pythonModule1Id, 
'Complete the following code to print "Hello, Python!"', 
'print("<input1>")', 
'{"input1": "Hello, Python!"}', 
'Correct! The code prints "Hello, Python!" as expected.', 
'Incorrect, make sure to use the correct print syntax.'),

(@pythonModule2Id, 
'Fill in the missing parts to create and print a variable.', 
'x = <input1>
print(x)', 
'{"input1": "10"}', 
'Good job! The variable is correctly declared and printed.', 
'Incorrect, ensure the variable is assigned the correct value.'),

(@pythonModule3Id, 
'Complete the loop to print numbers from 1 to 5.', 
'for i in range(<input1>):
	print(i)', 
'{"input1": "1, 6"}', 
'Well done! The loop correctly prints numbers from 1 to 5.', 
'Incorrect, check your loop range.'),

(@pythonModule4Id, 
'Write the code to take user input and display it.', 
'user_input = input("<input1>")
print(user_input)', 
'{"input1": "Enter something: "}', 
'Correct! The code correctly takes and prints user input.', 
'Incorrect, make sure you use the input function correctly.'),

(@pythonModule5Id, 
'Complete the function to return the square of a number.', 
'def square(num):
	return <input1>', 
'{"input1": "num * num"}', 
'Well done! The function correctly returns the square of the number.', 
'Incorrect, make sure your function returns the correct result.');
DECLARE @javaModule1Id INT;
DECLARE @javaModule2Id INT;
DECLARE @javaModule3Id INT;

-- Get the module_id for 'Introduction to Java'
SELECT @javaModule1Id = module_id 
FROM Modules 
WHERE course_id = 2 
AND module_name = 'Introduction to Java';

-- Get the module_id for 'Java Variables and Data Types'
SELECT @javaModule2Id = module_id 
FROM Modules 
WHERE course_id = 2 
AND module_name = 'Java Variables and Data Types';

-- Get the module_id for 'Java Control Statements'
SELECT @javaModule3Id = module_id 
FROM Modules 
WHERE course_id = 2 
AND module_name = 'Java Control Statements';
-- Insert exercises for Java modules
INSERT INTO Exercises (module_id, question_text, code_snippet, correct_answers, feedback_correct, feedback_incorrect)
VALUES 
(@javaModule1Id, 
'Complete the following code to print "Hello, Java!"', 
'System.out.println("<input1>");', 
'{"input1": "Hello, Java!"}', 
'Correct! The code prints "Hello, Java!" as expected.', 
'Incorrect, make sure to use the correct PrintStream.'),

(@javaModule2Id, 
'Fill in the missing parts to declare and initialize a variable.', 
'int num = <input1>;', 
'{"input1": "10"}', 
'Good job! The variable is correctly declared and initialized.', 
'Incorrect, ensure you assign the correct value to the variable.'),

(@javaModule3Id, 
'Complete the code to create a loop that prints numbers from 1 to 5.', 
'for (int i = <input1>; i <= 5; i++) {
	System.out.println(i);
	}', 
'{"input1": "1"}', 
'Well done! The loop correctly prints numbers from 1 to 5.', 
'Incorrect, check your loop initialization and range.');

-- Insert code snippets for 'Getting Started with Python' (Python)
DECLARE @pythonModule1Id INT;
SELECT @pythonModule1Id = module_id 
FROM Modules 
WHERE course_id = 1 
AND module_name = 'Getting Started with Python';

INSERT INTO ModuleCode (module_id, language, code_snippet)
VALUES
(@pythonModule1Id, 'Python', 'print("Hello, World!")'),

(@pythonModule1Id, 'Python', 'x = 5
if x > 0:
print("x is positive")');

-- Insert code snippets for 'Python Variables and Data Types' (Python)
DECLARE @pythonModule2Id INT;
SELECT @pythonModule2Id = module_id 
FROM Modules 
WHERE course_id = 1 
AND module_name = 'Python Variables and Data Types';

INSERT INTO ModuleCode (module_id, language, code_snippet)
VALUES
(@pythonModule2Id, 'Python', 'name = "John"
age = 30
is_student = False'),

(@pythonModule2Id, 'Python', 'a = 5
b = 3.14
c = 1 + 2j
print(a, b, c)');

-- Insert code snippets for 'Control Flow and Loops in Python' (Python)
DECLARE @pythonModule3Id INT;
SELECT @pythonModule3Id = module_id 
FROM Modules 
WHERE course_id = 1 
AND module_name = 'Control Flow and Loops in Python';

INSERT INTO ModuleCode (module_id, language, code_snippet)
VALUES
(@pythonModule3Id, 'Python', 'for i in range(5):
print(i)'),

(@pythonModule3Id, 'Python', 'x = 10
while x > 0:
print(x)
x -= 1');
-- Insert code snippets for 'Python Input and Output' (Python)
DECLARE @pythonModule4Id INT;
SELECT @pythonModule4Id = module_id 
FROM Modules 
WHERE course_id = 1 
AND module_name = 'Python Input and Output';

INSERT INTO ModuleCode (module_id, language, code_snippet)
VALUES
(@pythonModule4Id, 'Python', 'name = input("Enter your name: ")
print("Hello, " + name)'),

(@pythonModule4Id, 'Python', 'with open("file.txt", "w") as file:
file.write("Hello World")
with open("file.txt", "r") as file:
content = file.read()
print(content)');

-- Insert code snippets for 'Functions in Python' (Python)
DECLARE @pythonModule5Id INT;
SELECT @pythonModule5Id = module_id 
FROM Modules 
WHERE course_id = 1 
AND module_name = 'Functions in Python';

INSERT INTO ModuleCode (module_id, language, code_snippet)
VALUES
(@pythonModule5Id, 'Python', 'def greet(name):
return "Hello, " + name
print(greet("Alice"))'),

(@pythonModule5Id, 'Python', 'def factorial(n):\n    if n == 0:
return 1
else:
return n * factorial(n - 1)
print(factorial(5))');


-- Insert code snippets for 'Introduction to Java' (Java)
DECLARE @javaModule1Id INT;
SELECT @javaModule1Id = module_id 
FROM Modules 
WHERE course_id = 2 
AND module_name = 'Introduction to Java';

INSERT INTO ModuleCode (module_id, language, code_snippet)
VALUES
(@javaModule1Id, 'Java', 'public class Main {
	public static void main(String[] args) {
	System.out.println("Hello, World!");
		}
			}'),

(@javaModule1Id, 'Java', 'public class Main {
	public static void main(String[] args) {
int x = 5;
if (x > 0) {
System.out.println("x is positive");
	}
			}
										}');

-- Insert code snippets for 'Java Variables and Data Types' (Java)
DECLARE @javaModule2Id INT;
SELECT @javaModule2Id = module_id 
FROM Modules 
WHERE course_id = 2 
AND module_name = 'Java Variables and Data Types';

INSERT INTO ModuleCode (module_id, language, code_snippet)
VALUES
(@javaModule2Id, 'Java', 'String name = "John";
							int age = 30;
							boolean isStudent = false;'),

(@javaModule2Id, 'Java', 'int a = 5;
				  double b = 3.14;
                  char c = ''A'';
                  System.out.println(a + " " + b + " " + c);');

-- Insert code snippets for 'Java Control Statements' (Java)
DECLARE @javaModule3Id INT;
SELECT @javaModule3Id = module_id 
FROM Modules 
WHERE course_id = 2 
AND module_name = 'Java Control Statements';

INSERT INTO ModuleCode (module_id, language, code_snippet)
VALUES
(@javaModule3Id, 'Java', 'for (int i = 0; i < 5; i++) {
									System.out.println(i);
														}'),

(@javaModule3Id, 'Java', 'int x = 10;
					while (x > 0) {
					System.out.println(x);
					x--;
							}');

