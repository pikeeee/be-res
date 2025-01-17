const Chat = require('../models/Chat');

// Get chat history by User ID
exports.getChatHistory = async (req, res) => {
    try {
        const chat = await Chat.findOne({ userId: req.params.userId });
        res.status(200).json(chat);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching chat history' });
    }
};

// Send a new message
exports.sendMessage = async (req, res) => {
    const { sender, message } = req.body;
    try {
        let chat = await Chat.findOne({ userId: req.params.userId });
        if (!chat) {
            chat = new Chat({ userId: req.params.userId, messages: [{ sender, message }] });
            await chat.save();
        } else {
            chat.messages.push({ sender, message });
            await chat.save();
        }
        res.status(200).json(chat);
    } catch (err) {
        res.status(500).json({ error: 'Error sending message' });
    }
};
