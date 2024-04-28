const express=require("express");
const app=express();
const db=require('./db');
require('dotenv').config();
//const passport =require('./auth');

const body_parser=require("body-parser");
app.use(body_parser.json());



const userRoutes=require('./routes/userRoutes');
const candidateRoutes=require('./routes/candidateRoutes');

app.get('/', (req,res)=>{
    console.log("reached");
}
     );
app.use('/user',userRoutes);
app.use('/candidate',candidateRoutes);

const PORT=process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log("listining on port 3000");
})