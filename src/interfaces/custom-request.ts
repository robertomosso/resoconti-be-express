import { Request as ExpressRequest } from 'express';

export interface CustomRequest extends ExpressRequest {
    userId?: string;
	fileId?: string;
}