//role_users/users
/**
 * @swagger
 * tags:
 *   name: users
 *   description: The users managing API
 */
/**
 * @swagger
 * /role_users/users:
 *   post:
 *     summary: Create a new user
 *     tags: [users]
 *     description: Create a new user record with the provided details.
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
 *             user:
 *               username: John Doe
 *               password: h32j3h
 *               email: John_Doe@gmail.com
 *               role_id: 1
 *     responses:
 *       201:
 *         description: user created successfully.
 *         content:
 *           application/json:
 *             user:
 *               ID: 1
 *               USERNAME: Idit Rozental
 *               PASSWORD: jsad439
 *               ENAIL: idit@gmail.com
 *               ROLE_ID: 1
 *       400:
 *         description: Bad request. Ensure all required fields are provided.
 *         content:
 *           application/json:
 *             user:
 *               error: Bad request. Missing required fields.
 */
/**
 * @swagger
 * /role_users/users/{id}:
 *   get:
 *     summary: Get an user by ID
 *     tags: [users]
 *     description: Retrieve user details based on the provided ID.
  *     parameters:
 *       - in: path
 *         id: id
 *         required: true
 *         description: The ID of the employee to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response with the employee details.
 *         content:
 *           application/json:
 *             user:
 *               ID: 1
 *               USERNAME: Idit Rozental
 *               PASSWORD: jsad439
 *               ENAIL: idit@gmail.com
 *               ROLE_ID: 1
 * 
 *       404:
 *         description: Employee not found with the specified ID.
 *         content:
 *           application/json:
 *              uesr:
 *               error: cannot find employee with id {id}
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
*       user:
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
*             description: role_id of the user
*          user:
*            username: Idit Rozental
*            password: jsad439
*            email: idit@gmail.com
*            role_id: 1
*/