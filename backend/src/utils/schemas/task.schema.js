const { z } = require('zod');
const { requiredString, optionalIsoDate } = require('./common.schema');

const PHASES = ['PRE_QUALIFY', 'PREPARE', 'REGISTER', 'REVIEW', 'LIVE'];

const toggleTaskSchema = z.object({
  completed: z.boolean(),
}).strict();

const createTaskSchema = z.object({
  title: requiredString(300),
  phase: z.enum(PHASES),
  dueDate: optionalIsoDate('dueDate'),
}).strict();

const updateTaskSchema = z.object({
  title: requiredString(300).optional(),
  dueDate: optionalIsoDate('dueDate'),
  completed: z.boolean().optional(),
  phase: z.enum(PHASES).optional(),
}).strict();

module.exports = { toggleTaskSchema, createTaskSchema, updateTaskSchema };
