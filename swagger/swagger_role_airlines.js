
//categories

/**
 * @swagger
 * tags:
 *   name: role_airlines
 *   description: The role_airlines managing API
 */

//role_airlines/airlines

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
 * /role_airlines/users:
 *   post:
 *     summary: Create a new user
 *     tags: [role_airlines]
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
 * /role_airlines/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [role_airlines]
 *     description: Retrieve user details based on the provided ID. Requires authentication.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to retrieve.
 *         schema:
 *           type: number
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
 * components:
 *   securitySchemes:
 *     CustomAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 *       description: Enter API key as "Bearer <API_KEY>"
 *
 * /role_airlines/users/search:
 *   get:
 *     summary: Search users by ID, username, email, or password
 *     tags: [role_airlines]
 *     description: Search for users based on provided criteria. Requires authentication.
 *     parameters:
 *       - in: query
 *         name: id
 *         description: (Optional) Filter users by ID.
 *         type: string
 *       - in: query
 *         name: username
 *         description: (Optional) Filter users by username.
 *         type: string
 *       - in: query
 *         name: email
 *         description: (Optional) Filter users by email address.
 *         type: string
 *       - in: query
 *         name: password
 *         description: (Optional) Filter users by password.
 *         type: string
 *     security:
 *       - CustomAuth: []
 *     responses:
 *       '200':
 *         description: Successful response with matching user details.
 *         content:
 *           application/json:
 *             schema:
 *                 properties:
 *                   id:
 *                     type: number
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 *                   password:
 *                     type: string
 *                   role_id:
 *                     type: number
 *
 *                   # Exclude password from response
 *       '404':
 *         description: No users found matching the criteria.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: No users found matching the search criteria.
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
 * /role_airlines/users/{id}:
 *   put:
 *     summary: Update the user by the ID
 *     tags: [role_airlines]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     security:
 *       - CustomAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/user'
 *     responses:
 *       200:
 *         description: The user was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user'
 *       404:
 *         description: The user was not found
 *       500:
 *         description: Some error happened
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
 * /role_airlines/users/{id}:
 *   delete:
 *     summary: Delete an user by ID
 *     tags: [role_airlines]
 *     description: Delete the user record with the specified ID. Requires authentication.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to delete.
 *         schema:
 *           type: integer
 *     security:
 *       - CustomAuth: []
 *     responses:
 *       204:
 *         description: user deleted successfully.
 *       404:
 *         description: user not found with the specified ID.
 *         content:
 *           application/json:
 *             example:
 *               error: cannot find user with id {id}
 */
/**
*  @swagger
*  components:
*    schemas:
*      role_airlines:
*        type: object
*        required:
*          - users
*          - airlines
*          - flights
*        properties:
*          users:
*            type: object
*            required:
*              - username
*              - password
*              - email
*            properties:
*              username:
*                type: string
*                description: The username of the user.
*                example: test tsets
*              password:
*                type: string
*                example: test_1
*              email:
*                type: string
*                example: test_tsets@gmail.com
*          airlines:
*            type: object
*            required:
*              - name
*              - country_id
*              - user_id
*            properties:
*              name:
*                type: string
*                example: airtest
*              country_id:
*                type: integer
*                example: 20
*              user_id:
*                type: integer
*                example: 10
*          flights:
*            type: object
*            required:
*              - airline_id
*              - origin_country_id
*              - destination_country_id
*              - departure_time
*              - landing_time
*              - plane_id
*              - remaining_tickets
*            properties:
*              airline_id:
*                type: integer
*                example: 10
*              origin_country_id:
*                type: integer
*                example: 74
*              destination_country_id:
*                type: integer
*                example: 21
*              departure_time:
*                type: string
*                format: date-time
*                example: "2024-01-30T05:00:00.000Z"
*              landing_time:
*                type: string
*                format: date-time
*                example: "2024-01-30T16:00:00.000Z"
*              plane_id:
*                type: integer
*                example: 2
*              remaining_tickets:
*                type: integer
*                example: 195
*            xml:
*              name: role_airlines
*/