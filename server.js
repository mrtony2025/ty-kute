import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static dashboard files

// Helper paths to JSON database files
const eventsFilePath = path.join(__dirname, 'data', 'events.json');
const promptsFilePath = path.join(__dirname, 'data', 'prompts.json');

// Helper to read JSON files
const readJsonFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Lỗi khi đọc file ${filePath}:`, error);
        return [];
    }
};

// Helper to write JSON files
const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Lỗi khi ghi file ${filePath}:`, error);
        return false;
    }
};

// --- REST API ENDPOINTS ---

// 1. Paranormal Events API
app.get('/api/events', (req, res) => {
    const events = readJsonFile(eventsFilePath);
    res.json(events);
});

app.post('/api/events', (req, res) => {
    const events = readJsonFile(eventsFilePath);
    const newEvent = req.body;

    if (!newEvent.id || !newEvent.name || !newEvent.severity) {
        return res.status(400).json({ error: 'Thiếu thông tin sự kiện bắt buộc.' });
    }

    // Check if event ID exists to update, else insert new
    const existingIndex = events.findIndex(e => e.id === newEvent.id);
    if (existingIndex !== -1) {
        events[existingIndex] = newEvent;
    } else {
        events.push(newEvent);
    }

    if (writeJsonFile(eventsFilePath, events)) {
        res.status(201).json(newEvent);
    } else {
        res.status(500).json({ error: 'Không thể lưu cơ sở dữ liệu sự kiện.' });
    }
});

app.delete('/api/events/:id', (req, res) => {
    const events = readJsonFile(eventsFilePath);
    const eventId = req.params.id;
    const filteredEvents = events.filter(e => e.id !== eventId);

    if (events.length === filteredEvents.length) {
        return res.status(404).json({ error: 'Không tìm thấy sự kiện cần xóa.' });
    }

    if (writeJsonFile(eventsFilePath, filteredEvents)) {
        res.json({ message: `Đã xóa sự kiện ${eventId} thành công.` });
    } else {
        res.status(500).json({ error: 'Không thể lưu cơ sở dữ liệu sự kiện sau khi xóa.' });
    }
});

// 2. AI Prompts API
app.get('/api/prompts', (req, res) => {
    const prompts = readJsonFile(promptsFilePath);
    res.json(prompts);
});

app.post('/api/prompts', (req, res) => {
    const prompts = readJsonFile(promptsFilePath);
    const newPrompt = req.body;

    if (!newPrompt.id || !newPrompt.name || !newPrompt.content) {
        return res.status(400).json({ error: 'Thiếu thông tin prompt bắt buộc.' });
    }

    const existingIndex = prompts.findIndex(p => p.id === newPrompt.id);
    if (existingIndex !== -1) {
        prompts[existingIndex] = newPrompt;
    } else {
        prompts.push(newPrompt);
    }

    if (writeJsonFile(promptsFilePath, prompts)) {
        res.status(201).json(newPrompt);
    } else {
        res.status(500).json({ error: 'Không thể lưu cơ sở dữ liệu prompt.' });
    }
});

app.delete('/api/prompts/:id', (req, res) => {
    const prompts = readJsonFile(promptsFilePath);
    const promptId = req.params.id;
    const filteredPrompts = prompts.filter(p => p.id !== promptId);

    if (prompts.length === filteredPrompts.length) {
        return res.status(404).json({ error: 'Không tìm thấy prompt cần xóa.' });
    }

    if (writeJsonFile(promptsFilePath, filteredPrompts)) {
        res.json({ message: `Đã xóa prompt ${promptId} thành công.` });
    } else {
        res.status(500).json({ error: 'Không thể lưu cơ sở dữ liệu prompt sau khi xóa.' });
    }
});

// Start Fullstack Server
app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🔥 VIETNAM HORROR AI GAME FACTORY - SERVER STARTED`);
    console.log(`➜ Local View:   http://localhost:${PORT}`);
    console.log(`➜ REST API:     http://localhost:${PORT}/api/events`);
    console.log(`==================================================\n`);
});
