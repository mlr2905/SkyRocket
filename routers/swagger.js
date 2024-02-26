
//categories
/**
 * @swagger
 * tags:
 *   name: users
 *   description: The users managing API
 */
/**
 * @swagger
 * tags:
 *   name: customers
 *   description: The customers managing API
 */

//role_users/users
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     CustomAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 *       description: Enter API key as "Bearer <API_KEY>"
 * 
 * /role_users/users:
 *   post:
 *     summary: Create a new user
 *     tags: [users]
 *     description: Create a new user record with the provided details. Requires authentication.
 *     security:
 *       - CustomAuth: []
 *     deprecated: false
 *     readOnly: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *               email:
 *                 type: string
 *                 description: The email of the user.
 *               role_id:
 *                 type: number
 *                 description: The role_id of the user.
 *     responses:
 *       '201':
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     ID:
 *                       type: number
 *                     USERNAME:
 *                       type: string
 *                     PASSWORD:
 *                       type: string
 *                     EMAIL:
 *                       type: string
 *                     ROLE_ID:
 *                       type: number
 *       '400':
 *         description: Bad request. Ensure all required fields are provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: string
 */


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     CustomAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 *       description: Enter API key as "Bearer <API_KEY>"
 * 
 * /role_users/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [users]
 *     description: Retrieve user details based on the provided ID. Requires authentication.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to retrieve.
 *         schema:
 *           type: integer
 *     security:
 *       - CustomAuth: []
 *     responses:
 *       '200':
 *         description: Successful response with the user details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 example:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     password:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role_id:
 *                       type: number
 *       '404':
 *         description: User not found with the specified ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 example:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: string
 *         example:
 *             error: Cannot find user with ID {id}.
 */


/**
 * @swagger
 * /role_users/users/{id}:
*   put:
*    summary: Update the user by the id
*    tags: [users]
*    parameters:
*      - in: path
*        name: id
*        schema:
*          type: string
*        required: true
*        description: The user id
*    requestBody:
*      required: true
*      content:
*        application/json:
*          schema:
*            $ref: '#/components/schemas/user'
*    responses:
*      200:
*        description: The user was updated
*        content:
*          application/json:
*            schema:
*              $ref: '#/components/schemas/user'
*      404:
*        description: The user was not found
*      500:
*        description: Some error happened
*/

/**
 * @swagger
 * /role_users/users/{id}:
 *   delete:
 *     summary: Delete an user by ID
 *     tags: [users]
 *     description: Delete the user record with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: user deleted successfully.
 *       404:
 *         description: user not found with the specified ID.
 *         content:
 *           application/json:
 *             user:
 *               error: cannot find user with id {id}
 */

/**
*  @swagger
*  components:
*     schemas:
*       example:
*         type: object
*         required:
*           - username
*           - password
*           - email
*           - role_id
*         properties:
*           username:
*             type: string
*             description: The username of the user.
*           password:
*             type: string
*             description: The password of the user.
*           email:
*             type: string
*             description: The email of the user.
*           role_id:
*             type: number
*             description: The role_id of the user.
*       example:
*         username: Idit Rozental
*         password: jsad439
*         email: idit@gmail.com
*         role_id: 1
*/