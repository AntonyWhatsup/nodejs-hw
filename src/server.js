import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import notesRouter from './routes/notesRoutes.js'; 
import { errors } from 'celebrate';

app.use(cookieParser());
app.use(authRouter);
app.use(userRouter);
app.use(notesRouter); 
app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);
