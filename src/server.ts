import express from "express";

const mainRouter = express.Router();

mainRouter.route("/testing2").get((req, res) => {
    res.status(200).json({success:true, message:"testing2 router"});
});
mainRouter.route("/testing3").get((req, res) => {
    res.status(200).json({success:true, message:"testing3 router"});
});

export default mainRouter;