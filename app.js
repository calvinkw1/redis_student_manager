var express = require("express"),
    app = express(),
    redis = require("redis"),
    client = redis.createClient(),
    methodOverride = require("method-override"),
    bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));

// Uncomment below if you want to include css/js/imgs -> make a folder and use:
// app.use(express.static(__dirname + '/public'));

app.get("/", function(req, res) {
  client.lrange("students", 0, -1, function(err, names) {
    res.render("index", {
      names: names
    });
  });
});

app.get("/students/:name/edit", function(req, res) {
  client.lrange("students", 0, -1, function(err, names) {
    names.forEach(function(name) {
      if (name === req.params.name) {
        res.render("edit", {
          name: name
        });
      }
    });
  });
});

app.post("/create", function(req, res) {
  client.lpush("students", req.body.name);
  res.redirect("/");
});

app.put("/students/:name", function(req, res) {
  origName = req.params.name;
  newName = req.body.newName;
  console.log(origName + ", " + newName);
  client.lrange("students", 0, -1, function(err, names) {    
    for (var i = 0; i < names.length; i++) {
      if (names[i] === origName) {
        client.lset("students", i, newName);
      }
    }
    res.redirect("/");
  });
});

app.delete("/removeall", function(req, res) {
  client.lrange("students", 0, -1, function(err, names) {
    names.forEach(function(name) {
      client.lrem("students", 1, name);
    });
    res.redirect("/");
  });
});

app.delete("/remove/:name", function(req, res) {
  client.lrange("students", 0, -1, function(err, names) {
    names.forEach(function(name) {
      if (name === req.params.name) {
        client.lrem("students", 1, name);
        res.redirect("/");
      }
    });
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});