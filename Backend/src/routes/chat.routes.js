const express = require('express');
const authMiddleware = require("../middlewares/auth.middleware")
const chatController = require("../controllers/chat.controller")


const router = express.Router();

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Create a new chat
 *     description: Create a new chat conversation for the authenticated user
 *     tags: [Chats]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateChatRequest'
 *     responses:
 *       201:
 *         description: Chat created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Chat created successfully
 *                 chat:
 *                   $ref: '#/components/schemas/Chat'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', authMiddleware.authUser, chatController.createChat)


/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: Get all chats
 *     description: Retrieve all chat conversations for the authenticated user
 *     tags: [Chats]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Chats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chats:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chat'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authMiddleware.authUser, chatController.getChats)


/**
 * @swagger
 * /api/chat/messages/{id}:
 *   get:
 *     summary: Get chat messages
 *     description: Retrieve all messages for a specific chat
 *     tags: [Messages]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/messages/:id', authMiddleware.authUser, chatController.getMessages)

/**
 * @swagger
 * /api/chat/{id}:
 *   put:
 *     summary: Rename a chat
 *     description: Update the title of an existing chat
 *     tags: [Chats]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RenameChatRequest'
 *     responses:
 *       200:
 *         description: Chat renamed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Chat renamed successfully
 *                 chat:
 *                   $ref: '#/components/schemas/Chat'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', authMiddleware.authUser, chatController.renameChat)

/**
 * @swagger
 * /api/chat/{id}:
 *   delete:
 *     summary: Delete a chat
 *     description: Delete a chat and all its messages permanently
 *     tags: [Chats]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Chat deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authMiddleware.authUser, chatController.deleteChat)
 

module.exports = router;