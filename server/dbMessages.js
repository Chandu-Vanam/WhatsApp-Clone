import mongoose from "mongoose";

//schema=- how data is gonna build
const whatsappSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: Boolean
});

export default mongoose.model("messagecontents", whatsappSchema);
