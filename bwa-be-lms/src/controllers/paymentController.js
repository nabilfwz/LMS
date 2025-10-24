import mongoose from "mongoose";
import Transaction from "../models/transactionModel.js";

export const handlePayment = async (req, res) => {
    try {
        const body = req.body;
        const orderId = body.order_id;

        // pastikan cuma jalan kalau orderId valid
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            console.log("OrderId bukan ObjectId valid:", orderId);
            return res.status(400).json({ message: "Invalid order_id" });
        }

        switch (body.transaction_status) {
            case "capture":
            case "settlement":
                await Transaction.findByIdAndUpdate(orderId, { status: "success" });
                break;
            case "deny":
            case "cancel":
            case "expire":
            case "failure":
                await Transaction.findByIdAndUpdate(orderId, { status: "failed" });
                break;
        }

        return res.json({ message: "Handle Payment Success",
            data:{}
         });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
