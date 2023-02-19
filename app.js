const express = require("express");
const app = express();
const mongoose = require("mongoose");

app.set("view engine", "pug");
app.set("views", "views");
app.use(express.urlencoded({ extended: false }));

mongoose.set("strictQuery", false);
mongoose.connect(
  process.env.MONGODB_URL || "mongodb://localhost:27017/mongo-1",
  { useNewUrlParser: true }
);
mongoose.connection.on("connection", (e) => {
  console.log("Database connected");
});
mongoose.connection.off("error", (e) => {
  console.error(e);
});

var schemaObject = mongoose.Schema({
  count: { type: Number, default: 1 },
  name: String,
  date: Date,
});

var Visitor = mongoose.model("Visitor", schemaObject);

app.get("/", async (req, res) => {
  const { name } = req.query;
  let resultVisitor;
  if (name) {
    resultVisitor = await Visitor.findOne({ name: name });
    if (resultVisitor) {
      resultVisitor.count += 1;
      resultVisitor.date = Date.now();
    } else {
      resultVisitor = new Visitor({ name: name, date: Date.now(), count: 1 });
    }
  } else {
    resultVisitor = new Visitor({
      name: "Anónimo",
      date: Date.now(),
      count: 1,
    });
  }
  await resultVisitor.save();
  const visitors = await Visitor.find();
  res.render("index", { visitors: visitors });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port 3000!");
});
