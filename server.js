import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve node_modules
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

app.listen(port, () => {
    console.log(`Demo running at http://localhost:${port}`);
}); 