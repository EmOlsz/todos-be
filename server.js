import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/tasks';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const Task = new mongoose.model('Task', {
	description: {
		type: String,
		minlength: 10,
		maxlength: 100,
	},
	isChecked: {
		type: Boolean,
		default: false,
	},
	date: {
		type: Number,
		default: Date.now,
	},
});

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.send('Hello world');
});

app.get('/tasks', async (req, res) => {
	const tasks = await Task.find({});
	res.status(200).json(tasks);
});

app.post('/tasks', async (req, res) => {
	const { description } = req.body;

	try {
		const newTask = await new Task({ description }).save();
		res.status(200).json(newTask);
	} catch (error) {
		res.status(400).json(error);
	}
});

app.post('/tasks/:id/check', async (req, res) => {
	const { id } = req.params;

	try {
		const updatedTask = await Task.findByIdAndUpdate(
			id,
			[
				{
					$set: {
						isChecked: {
							$eq: [false, '$isChecked'],
						},
					},
				},
			],
			{
				new: true,
			}
		);
		res.status(200).json(updatedTask);
	} catch (error) {
		res.status(400).json(error);
	}
});

app.listen(port, () => {
	// eslint-disable-next-line
	console.log(`Server running on http://localhost:${port}`);
});
