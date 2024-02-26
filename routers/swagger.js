
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
/**
 * @swagger
 * tags:
 *   name: flights
 *   description: The flights managing API
 */
/**
 * @swagger
 * tags:
 *   name: tickets
 *   description: The tickets managing API
 */
/**
 * @swagger
 * tags:
 *   name: passengers
 *   description: The passengers managing API
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
 * components:
 *   securitySchemes:
 *     CustomAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 *       description: Enter API key as "Bearer <API_KEY>"
 * 
 * /role_users/users/{id}:
 *   put:
 *     summary: Update the user by the ID
 *     tags: [users]
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
 * /role_users/users/{id}:
 *   delete:
 *     summary: Delete an user by ID
 *     tags: [users]
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

//role_users/customers


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
 * /role_users/customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [customers]
 *     description: Create a new customer record with the provided details. Requires authentication.
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
 *               first_name:
 *                 type: string
 *                 description: The first name of the customer.
 *               last_name:
 *                 type: string
 *                 description: The last name of the customer.
 *               address:
 *                 type: string
 *                 description: The address of the customer.
 *               phone_no:
 *                 type: string
 *                 description: The phone number of the customer.
 *               credit_card_no:
 *                 type: string
 *                 description: The credit card number of the user with only the last four digits revealed, preceded by 12 asterisks.
 *               user_id:
 *                 type: number
 *                 description: The user ID.
 *               user_name:
 *                 type: string
 *                 description: The username of the user.
 *     responses:
 *       '201':
 *         description: customer created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customer:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     address:
 *                       type: string
 *                     phone_no:
 *                       type: string
 *                     credit_card_no:
 *                       type: string
 *                     user_id:
 *                       type: number
 *                     user_name:
 *                       type: string
 *       '400':
 *         description: Bad request. Ensure all required fields are provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customer:
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
 * /role_users/customers/{id}:
 *   get:
 *     summary: Get a customer by ID
 *     tags: [customers]
 *     description: Retrieve customer details based on the provided ID. Requires authentication.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the customer to retrieve.
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
 *                 id:
 *                   type: number
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 address:
 *                   type: string
 *                 phone_no:
 *                   type: string
 *                 credit_card_no:
 *                   type: string
 *                   description: The credit card number of the user with only the last four digits revealed, preceded by 12 asterisks.
 *                 user_id:
 *                   type: number
 *                 user_name:
 *                   type: string
 *       '404':
 *         description: User not found with the specified ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: Cannot find customer with ID {id}.
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
 * /role_users/customers/{id}:
 *   put:
 *     summary: Update the customer by the ID
 *     tags: [customers]
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
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: The first name of the user.
 *               last_name:
 *                 type: string
 *                 description: The last name of the user.
 *               address:
 *                 type: string
 *                 description: The address of the user.
 *               phone_no:
 *                 type: string
 *                 description: The phone number of the user.
 *               credit_card_no:
 *                 type: string
 *                 description: The credit card number of the user.
 *               user_id:
 *                 type: number
 *                 description: The user ID.
 *               user_name:
 *                 type: string
 *                 description: The username of the user.
 *     responses:
 *       200:
 *         description: The user was updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 address:
 *                   type: string
 *                 phone_no:
 *                   type: string
 *                 credit_card_no:
 *                   type: string
 *                   description: The credit card number of the user with only the last four digits revealed, preceded by 12 asterisks.
 *                 user_id:
 *                   type: number
 *                 user_name:
 *                   type: string
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
 * /role_users/customers/{id}:
 *   put:
 *     summary: Update the customer by the ID
 *     tags: [customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The customer id
 *     security:
 *       - CustomAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: The first name of the customer.
 *               last_name:
 *                 type: string
 *                 description: The last name of the customer.
 *               address:
 *                 type: string
 *                 description: The address of the customer.
 *               phone_no:
 *                 type: string
 *                 description: The phone number of the customer.
 *               credit_card_no:
 *                 type: string
 *                 description: The credit card number of the customer.
 *     responses:
 *       200:
 *         description: The user was updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 address:
 *                   type: string
 *                 phone_no:
 *                   type: string
 *                 credit_card_no:
 *                   type: string
 *                   description: The credit card number of the user with only the last four digits revealed, preceded by 12 asterisks.
 *       404:
 *         description: The customer was not found
 *       500:
 *         description: Some error happened
 */

///

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
 * /role_users/flights
 *   get:
 *     summary: Get a flights all
 *     tags: [flights]
 *     description: Retrieve flights details.
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
 *                     id:
 *                       type: number
 *                     airline_id:
 *                       type: number
 *                     origin_country_id:
 *                       type: number
 *                     destination_country_id:
 *                       type: number
 *                     departure_time:
 *                       type: string
 *                     landing_time:
 *                       type: string
 *                     plane_id:
 *                       type: number
 *                     remaining_tickets:
 *                       type: number
 *                     flight_code:
 *                       type: string
 *                     airline_name:
 *                       type: string
 *                     origin_country_name:
 *                       type: string
 *                     destination_country_name:
 *                       type: string
 *                     Total_tickets:
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
 * /role_users/flights/{id}:
 *   get:
 *     summary: Get a flight by ID
 *     tags: [flights]
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
 *                     id:
 *                       type: number
 *                     airline_id:
 *                       type: number
 *                     origin_country_id:
 *                       type: number
 *                     destination_country_id:
 *                       type: number
 *                     departure_time:
 *                       type: string
 *                     landing_time:
 *                       type: string
 *                     plane_id:
 *                       type: number
 *                     remaining_tickets:
 *                       type: number
 *                     flight_code:
 *                       type: string
 *                     airline_name:
 *                       type: string
 *                     origin_country_name:
 *                       type: string
 *                     destination_country_name:
 *                       type: string
 *                     Total_tickets:
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


