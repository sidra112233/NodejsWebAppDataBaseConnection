var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var compiler = require("compilex");
var app = express();
// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
var option = { stats: true };
compiler.init(option);
app.get("/", function (req, res) {
    res.render("index", {
        languages: [
            { value: "c", label: "C" },
            { value: "cpp", label: "C++" },
            { value: "python", label: "Python" }
        ],
        themes: [
            { value: "vs-dark", label: "Dark" },
            { value: "light", label: "Light" }
        ],
        userLang: "python",
        userTheme: "vs-dark",
        fontSize: 20
    });
});
app.post("/compilecode", function (req, res) {
    var code = req.body.code;
    var input = req.body.input;
    var inputRadio = req.body.inputRadio;
    var lang = req.body.lang;

    if (lang === "C" || lang === "C++") {
        var envData = { OS: "windows", cmd: "g++", options: { timeout: 10000 } };
        if (inputRadio === "true") {
            compiler.compileCPPWithInput(envData, code, input, function (data) {
                if (data.error) {
                    res.send(data.error);
                } else {
                    res.send(data.output);
                }
            });
        } else {
            compiler.compileCPP(envData, code, function (data) {
                if (data.error) {
                    res.send(data.error);
                } else {
                    res.send(data.output);
                }
            });
        }
    } else if (lang === "Python") {
        var envData = { OS: "windows" };
        if (inputRadio === "true") {
            compiler.compilePythonWithInput(envData, code, input, function (data) {
                if (data.error) {
                    res.send(data.error);
                } else {
                    res.send(data.output);
                }
            });
        } else {
            compiler.compilePython(envData, code, function (data) {
                if (data.error) {
                    res.send(data.error);
                } else {
                    res.send(data.output);
                }
            });
        }
    } else {
        res.send("Unsupported language");
    }
});

app.get("/fullStat", function (req, res) {
    compiler.fullStat(function (data) {
        res.send(data);
    });
});

app.listen(8080, function () {
    console.log("Server is running on port 8080");
});

compiler.flush(function () {
    console.log("All temporary files flushed!");
});
