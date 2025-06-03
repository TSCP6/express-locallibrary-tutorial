const mongoose = require("mongoose");
const {DataTime,DateTime} =require("luxon");
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, max: 100 },
  family_name: { type: String, required: true, max: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

AuthorSchema.virtual("name").get(function () {
  return this.family_name + ", " + this.first_name;
});

AuthorSchema.virtual("date_of_death_formatted").get(function(){
  if(this.date_of_death)
    return DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);
  else return;
});

AuthorSchema.virtual("date_of_birth_formatted").get(function(){
  if(this.date_of_birth)
    return DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
  else return;
});

AuthorSchema.virtual("lifespan").get(function () {
  let birth = this.date_of_birth
    ? this.date_of_birth.getFullYear()
    : "";
  let death = this.date_of_death
    ? this.date_of_death.getFullYear()
    : "";
  return birth + " - " + death;
});


AuthorSchema.virtual("url").get(function () {
  return "/catalog/author/" + this._id;
});

module.exports = mongoose.model("Author", AuthorSchema);
