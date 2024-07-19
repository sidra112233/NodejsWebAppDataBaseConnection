CREATE TABLE Student(
    student_id INT IDENTITY PRIMARY KEY NOT NULL,
    student_name VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE Courses(
    course_id INT IDENTITY(1,1) PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    description TEXT,
	payment_status VARCHAR(50),
    payment_amount DECIMAL(10, 2),
    payment_date DATE,
    enrolled_students INT DEFAULT 0,
    start_date DATE,
    duration INT
);
CREATE TABLE Enrollments (
    enrollment_id INT PRIMARY KEY,
    student_id INT,
    course_id INT,
    enrollment_date DATE,
    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
);
CREATE TABLE Modules (
    module_id INT PRIMARY KEY IDENTITY(1,1),
	course_id INT,
    module_name VARCHAR(100) NOT NULL,
    description VARCHAR(MAX),
   	created_at DATETIME DEFAULT GETDATE()
	FOREIGN KEY (course_id) REFERENCES Courses(course_id)
);
CREATE TABLE Materials (
    material_id INT PRIMARY KEY IDENTITY(1,1),
    module_id INT,  -- Foreign key referencing Modules table
    type VARCHAR(50),  -- Type of material (e.g., 'PDF', 'Video', 'LRO')
    title VARCHAR(255),  -- Title of the material
    link VARCHAR(MAX), -- Link to the material (URL or path)
	description VARCHAR(MAX),
	FOREIGN KEY (module_id) REFERENCES Modules(module_id)
    -- Add additional columns as needed (e.g., description, date uploaded, etc.)
);

CREATE TABLE Quizzes (
    quiz_id INT PRIMARY KEY IDENTITY(1,1) ,
    module_id INT,
    quiz_title TEXT,
	total_marks FLOAT,
    FOREIGN KEY (module_id) REFERENCES Modules(module_id)
);
CREATE TABLE QuizSubmissions (
    submission_id INT PRIMARY KEY IDENTITY(1,1),
    quiz_id INT NOT NULL,
    student_id INT NOT NULL,
	submission_date DATETIME DEFAULT GETDATE(),
    score FLOAT,
	FOREIGN KEY (student_id) REFERENCES Student(student_id),
	FOREIGN KEY (quiz_id) REFERENCES Quizzes(quiz_id)
);
CREATE TABLE QuizQuestions (
    question_id INT PRIMARY KEY IDENTITY(1,1),
    quiz_id INT ,
    question_text VARCHAR(MAX) NOT NULL,
    option1 VARCHAR(MAX) NOT NULL,
    option2 VARCHAR(MAX) NOT NULL,
    option3 VARCHAR(MAX) NOT NULL,
    option4 VARCHAR(MAX) NOT NULL,
    correct_option INT NOT NULL CHECK (correct_option BETWEEN 1 AND 4),
    explanation TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (quiz_id) REFERENCES Quizzes(quiz_id)
);
CREATE TABLE QuizAnswers (
    answer_id INT PRIMARY KEY IDENTITY(1,1),
    question_id INT NOT NULL,
    student_id INT NOT NULL,
    chosen_option INT NOT NULL CHECK (chosen_option BETWEEN 1 AND 4),
    is_correct BIT, -- Optional: Indicates whether the chosen option is correct
    answer_date DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (question_id) REFERENCES QuizQuestions(question_id),
    FOREIGN KEY (student_id) REFERENCES Student(student_id)
);
SELECT * FROM Courses;