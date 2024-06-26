
//categories

/**
 * @swagger
 * tags:
 *   name: role_admins
 *   description: The role_admins managing API
 */

//role_admins/users
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
 * /role_admins/users_role1:
 *   post:
 *     summary: Create a new user
 *     tags: [role_admins]
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
 * /role_admins/users_role2:
 *   post:
 *     summary: Create a new user
 *     tags: [role_admins]
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
 *                 example: tset_swagger
 *                 description: The username of the user.
 *               password:
 *                 type: string
 *                 example: Aasj212
 *                 description: The password of the user.
 *               email:
 *                 type: string
 *                 example: tset_swagger@gmail.com
 *                 description: The email of the user.
 *     responses:
 *       '201':
 *         description: Created 🆗
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: User 'tset_swagger' successfully created
 *       '409':
 *         description: Conflict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   example: Username 'tset_swagger' or email  tset_swagger@gmail.com  exist in the system
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
 * /role_admins/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [role_admins]
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
 * /role_admins/users/search:
 *   get:
 *     summary: Search users by ID, username, email, or password
 *     tags: [role_admins]
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
 * /role_admins/users/{id}:
 *   put:
 *     summary: Update the user by the ID
 *     tags: [role_admins]
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
 *             $ref: '#/components/schemas/users'
 *     responses:
 *       200:
 *         description: The user was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/users'
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
 * /role_admins/users/{id}:
 *   delete:
 *     summary: Delete an user by ID
 *     tags: [role_admins]
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
 * @swagger
 *
 * /--/:
 *   post:
 *     summary: 
 *     tags: [role_admins]
 *     description: 
 *     security:
 *       - CustomAuth: []
 *     deprecated: true
 *     readOnly: false 
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
 * /role_admins/airlines:
 *   post:
 *     summary: Create a new user_airlines
 *     tags: [role_admins]
 *     description: 
 *      <p> 1. Create a new user_airlines record with the provided details. Requires authentication.</p>
 *      <h3> 2.<b> 😬 You must first create a user user and then register the id of the new user.😬</b></h3>
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
 *               name:
 *                 type: string
 *                 example: airline_tset_swagger
 *                 description: The name of the user.
 *               country_id:
 *                 type: string
 *                 example: 1
 *                 description: The country_id of the user.
 *               user_id:
 *                 type: string
 *                 example: 32
 *                 description: The user_id of the user.
 *     responses:
 *       '201':
 *         description: Created 🆗
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: User 'tset_swagger' successfully created
 *       '409':
 *         description: Conflict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   example: name ${username} or user_id ${id} exist in the system
 *       '503':
 *         description: Conflict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   example: The request failed, try again later ${error}
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
 * /role_admins/airlines/{id}:
 *   get:
 *     summary: Get a user_airline by ID
 *     tags: [role_admins]
 *     description: Retrieve user_airline details based on the provided ID. Requires authentication.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user_airline to retrieve.
 *         schema:
 *           type: integer
 *     security:
 *       - CustomAuth: []
 *     responses:
 *       '200':
 *         description: 🆗
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: airline_tset
 *                   description: The name of the user.
 *                 country_id:
 *                   type: string
 *                   example: 1
 *                   description: The country_id of the user.
 *                 user_id:
 *                   type: string
 *                   example: 32
 *                   description: The user_id of the user.
 *       '404':
 *         description: Not Found
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: The id {id} you specified does not exist in the system
 *       '503':
 *         description: Service Unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: The request failed, try again later {error}
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
 * /role_admins/airlines/{id}:
 *   put:
 *     summary: Update the user_airline by the ID
 *     tags: [role_admins]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: airline_tset
 *                 description: The name of the user.
 *               country_id:
 *                 type: string
 *                 example: 1
 *                 description: The country_id of the user.
 *     responses:
 *       200:
 *         description: 🆗
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 name:
 *                   type: string
 *                   example: airline_tset
 *                   description: The name of the user.
 *                 country_id:
 *                   type: string
 *                   example: 1
 *                   description: The country_id of the user.
 *                 user_id:
 *                   type: string
 *                   example: 32
 *                   description: The user_id of the user.
 *       '404':
 *         description: Not Found
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: The id {id} you specified does not exist in the system
 *       '503':
 *         description: Service Unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: The request failed, try again later {error}
 */

/**
 * @swagger
 *
 * /-/-/:
 *   put:
 *     summary: 
 *     tags: [role_admins]
 *     description: 
 *     security:
 *       - CustomAuth: []
 *     deprecated: true
 *     readOnly: false 
 */

//role_admins/customers

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
 * /role_admins/customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [role_admins]
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
 * /role_admins/customers/{id}:
 *   get:
 *     summary: Get a customer by ID
 *     tags: [role_admins]
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
 * /role_admins/customers/{id}:
 *   put:
 *     summary: Update the customer by the ID
 *     tags: [role_admins]
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
 * /role_admins/customers/{id}:
 *   put:
 *     summary: Update the customer by the ID
 *     tags: [role_admins]
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
/**

/**
 * @swagger
 *
 * /_/_/_/:
 *   post:
 *     summary: 
 *     tags: [role_admins]
 *     description: 
 *     security:
 *       - CustomAuth: []
 *     deprecated: true
 *     readOnly: false 
 */

//role_admins/flights

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
 * /role_admins/flights:
 *   get:
 *     summary: Get all flights
 *     tags: [role_admins]
 *     description: Retrieve details for all flights. Requires authentication.
 *     security:
 *       - CustomAuth: []
 *     responses:
 *       '200':
 *         description: Successful response with details for all flights.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   airline_id:
 *                     type: number
 *                   origin_country_id:
 *                     type: number
 *                   destination_country_id:
 *                     type: number
 *                   departure_time:
 *                     type: string
 *                   landing_time:
 *                     type: string
 *                   plane_id:
 *                     type: number
 *                   remaining_tickets:
 *                     type: number
 *                   flight_code:
 *                     type: string
 *                   airline_name:
 *                     type: string
 *                   origin_country_name:
 *                     type: string
 *                   destination_country_name:
 *                     type: string
 *                   Total_tickets:
 *                     type: number
 *       '404':
 *         description: Error response if no flights are found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: No flights found.
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
 * /role_admins/airline_id/{id}:
 *   get:
 *     summary: Get flights by airline_id
 *     tags: [role_admins]
 *     description: Retrieve user_airline details based on the provided ID. Requires authentication.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user_airline to retrieve.
 *         schema:
 *           type: integer      
 *     security:
 *       - CustomAuth: []
 *     responses:
 *       '200':
 *         description: 🆗
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer     
 *                   example: 4
 *                 airline_id:
 *                   type: integer     
 *                   example: 25
 *                 origin_country_id:
 *                   type: integer     
 *                   example: 74
 *                 destination_country_id:
 *                   type: integer     
 *                   example: 19
 *                 departure_time:
 *                   type: string
 *                   example: "2024-03-03T05:00:00"
 *                 landing_time:
 *                   type: string
 *                   example: "2024-03-03T10:00:00"
 *                 plane_id:
 *                   type: integer     
 *                   example: 1
 *                 remaining_tickets:
 *                   type: integer     
 *                   example: 144
 *                 airline_name:
 *                   type: string
 *                   example: "Arkay"
 *                 origin_country_name:
 *                   type: string
 *                   example: "Israel"
 *                 destination_country_name:
 *                   type: string
 *                   example: "Thailand"
 *                 total_tickets:
 *                   type: integer     
 *                   example: 144
 *                 flight_code:
 *                   type: string     
 *                   example: 'e33776a8-2082-4c14-8c6f-7191c7207c4d'
 *       '404':
 *         description: Not Found
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: The id {id} you specified does not exist in the system
 *       '503':
 *         description: Service Unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: The request failed, try again later {error}
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
 * /role_admins/flights/{id}:
 *   get:
 *     summary: Get a user_airline by ID
 *     tags: [role_admins]
 *     description: Retrieve user_airline details based on the provided ID. Requires authentication.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user_airline to retrieve.
 *         schema:
 *           type: integer
 *     security:
 *       - CustomAuth: []
 *     responses:
 *       '200':
 *         description: 🆗
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer     
 *                   example: 4
 *                 airline_id:
 *                   type: integer     
 *                   example: 25
 *                 origin_country_id:
 *                   type: integer     
 *                   example: 74
 *                 destination_country_id:
 *                   type: integer     
 *                   example: 19
 *                 departure_time:
 *                   type: string
 *                   example: "2024-07-03T05:00:00"
 *                 landing_time:
 *                   type: string
 *                   example: "2024-07-03T10:00:00"
 *                 plane_id:
 *                   type: integer     
 *                   example: 1
 *                 remaining_tickets:
 *                   type: integer     
 *                   example: 144
 *                 airline_name:
 *                   type: string
 *                   example: "Arkay"
 *                 origin_country_name:
 *                   type: string
 *                   example: "Israel"
 *                 destination_country_name:
 *                   type: string
 *                   example: "Thailand"
 *                 total_tickets:
 *                   type: integer     
 *                   example: 144
 *                 flight_code:
 *                   type: string     
 *                   example: 'e33776a8-2082-4c14-8c6f-7191c7207c4d'
 *       '404':
 *         description: Not Found
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: The id {id} you specified does not exist in the system
 *       '503':
 *         description: Service Unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: The request failed, try again later {error}
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
 * /role_admins/flights:
 *   post:
 *     summary: Create a new flight
 *     tags: [role_admins]
 *     description: Create a new flight record with the provided details. Requires authentication.
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
 *               airline_id:
 *                 type: integer
 *                 example: 25
 *                 description: The airline_id of the flight.
 *               origin_country_id:
 *                 type: integer
 *                 example: 74
 *                 description: The origin_country_id of the flight.
 *               destination_country_id:
 *                 type: integer
 *                 example: 19
 *                 description: The destination_country_id of the flight.
 *               departure_time:
 *                 type: string
 *                 example: "2024-07-03T05:00:00"
 *                 description: The departure_time of the flight. *               
 *               landing_time:
 *                 type: string
 *                 example: "2024-07-03T10:00:00"
 *                 description: The landing_time of the flight. *               
 *               plane_id:
 *                 type: integer
 *                 example: 1
 *                 description: The plane_id of the flight.
 *     responses:
 *       '201':
 *         description: created 🆗
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer     
 *                   example: 4
 *                 airline_id:
 *                   type: integer     
 *                   example: 25
 *                 origin_country_id:
 *                   type: integer     
 *                   example: 74
 *                 destination_country_id:
 *                   type: integer     
 *                   example: 19
 *                 departure_time:
 *                   type: string
 *                   example: "2024-07-03T05:00:00"
 *                 landing_time:
 *                   type: string
 *                   example: "2024-07-03T10:00:00"
 *                 plane_id:
 *                   type: integer     
 *                   example: 1
 *                 remaining_tickets:
 *                   type: integer     
 *                   example: 144
 *                 flight_code:
 *                   type: string     
 *                   example: 'e33776a8-2082-4c14-8c6f-7191c7207c4d'
 *       '404':
 *         description: Not Found
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: The ${id} you specified does not exist in the ${name}
 *       '409':
 *         description: Conflict
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: The flight you want already exists
 *       '503':
 *         description: Service Unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: The request failed, try again later {error}
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
 * /role_admins/flights/{id}:
 *   put:
 *     summary: Update the flight by the ID
 *     tags: [role_admins]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The flights id
 *     security:
 *       - CustomAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               type: object
 *               properties:
 *                 airline_id:
 *                   type: integer     
 *                   example: 25
 *                 origin_country_id:
 *                   type: integer     
 *                   example: 74
 *                 destination_country_id:
 *                   type: integer     
 *                   example: 19
 *                 departure_time:
 *                   type: string
 *                   example: "2024-07-03T05:00:00"
 *                 landing_time:
 *                   type: string
 *                   example: "2024-07-03T10:00:00"
 *                 plane_id:
 *                   type: integer     
 *                   example: 1
 *     responses:
 *       200:
 *         description: 🆗
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer     
 *                   example: 4
 *                 airline_id:
 *                   type: integer     
 *                   example: 25
 *                 origin_country_id:
 *                   type: integer     
 *                   example: 74
 *                 destination_country_id:
 *                   type: integer     
 *                   example: 19
 *                 departure_time:
 *                   type: string
 *                   example: "2024-07-03T05:00:00"
 *                 landing_time:
 *                   type: string
 *                   example: "2024-07-03T10:00:00"
 *                 plane_id:
 *                   type: integer     
 *                   example: 1
 *                 remaining_tickets:
 *                   type: integer     
 *                   example: 144
 *       '404':
 *         description: Not Found
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: The id {id} you specified does not exist in the system
 *       '409':
 *         description: Not Found
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example:  The flight you want already exists
 *       '503':
 *         description: Service Unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: The request failed, try again later {error}
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
 * /role_admins/flights/{id}:
 *   delete:
 *     summary: Delete an flight by ID
 *     tags: [role_admins]
 *     description: Delete the flight record with the specified ID. Requires authentication.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the flight to delete.
 *         schema:
 *           type: integer
 *     security:
 *       - CustomAuth: []
 *     responses:
 *       204:
 *         description: No Content.
 *       '404':
 *         description: Not Found
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: The id {id} you specified does not exist in the system
 */

/**
 * @swagger
 *
 * /-/-/_:
 *   post:
 *     summary: 
 *     tags: [role_admins]
 *     description: 
 *     security:
 *       - CustomAuth: []
 *     deprecated: true
 *     readOnly: false 
 */
//role_admins/tickets

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
 * /role_admins/tickets:
 *   post:
 *     summary: Create a new ticket
 *     tags: [role_admins]
 *     description: Create a new ticket record with the provided details. Requires authentication.
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
 *               flight_id:
 *                 type: number
 *                 description: The ID of the flight.
 *               customer_id:
 *                 type: number
 *                 description: The ID of the customer.
 *               passenger_id:
 *                 type: number
 *                 description: The ID of the passenger.
 *               user_id:
 *                 type: number
 *                 description: The ID of the user.
 *               chair_id:
 *                 type: number
 *                 description: The ID of the chair.
 *     responses:
 *       '201':
 *         description: ticket created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticket:
 *                   type: object
 *                   properties:
 *                     ID:
 *                       type: number
 *                     flight_id:
 *                       type: number
 *                     customer_id:
 *                       type: number
 *                     passenger_id:
 *                       type: number
 *                     user_id:
 *                       type: number
 *                     chair_id:
 *                       type: number
 * 
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
 * /role_admins/passengers:
 *   post:
 *     summary: Create a new passenger
 *     tags: [role_admins]
 *     description: Create a new passenger record with the provided details. Requires authentication.
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
 *                 description: The first name of the passenger.
 *               last_name:
 *                 type: string
 *                 description: The last name of the passenger.
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: The date of birth of the passenger (YYYY-MM-DD).
 *               passport_number:
 *                 type: string
 *                 description: The passport number of the passenger.
 *               user_id:
 *                 type: number
 *                 description: The ID of the user.
 *               flight_id:
 *                 type: number
 *                 description: The ID of the flight.
 *     responses:
 *       '201':
 *         description: passenger created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 passenger:
 *                   type: object
 *                   properties:
 *                     ID:
 *                       type: number
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                     passport_number:
 *                       type: string
 *                     user_id:
 *                       type: number
 *                     flight_id:
 *                       type: number
 * 
 *       '400':
 *         description: Bad request. Ensure all required fields are provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 passenger:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: string
 */

/**
*  @swagger
*  components:
*    schemas:
*      role_admins:
*        type: object
*        required:
*          - users
*          - airlines
*          - customers
*          - flights
*          - tickets
*          - passengers
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
*          customers:
*            type: object
*            required:
*              - first_name
*              - last_name
*              - address
*              - phone_no
*              - credit_card_no
*            properties:
*              first_name:
*                type: string
*                example: test
*              last_name:
*                type: string
*                example: tests
*              address:
*                type: string
*                example: israel
*              phone_no:
*                type: string
*                example: 00507462964
*              credit_card_no:
*                type: string
*                example: 1234-1234-1234-7654
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
*          tickets:
*            type: object
*            required:
*              - flight_id
*              - customer_id
*              - passenger_id
*              - user_id
*              - chair_id
*            properties:
*              flight_id:
*                type: integer
*                example: 1
*              customer_id:
*                type: integer
*                example: 27
*              passenger_id:
*                type: integer
*                example: 2
*              user_id:
*                type: integer
*                example: 20
*              chair_id:
*                type: integer
*                example: 60
*          passengers:
*            type: object
*            required:
*              - first_name
*              - last_name
*              - date_of_birth
*              - passport_number
*              - user_id
*              - flight_id
*            properties:
*              first_name:
*                type: string
*                example: test tsets
*              last_name:
*                type: string
*                example: test_1
*              date_of_birth:
*                type: string
*                example: 29/05/1993
*              passport_number:
*                type: integer
*                example: 832382738
*              user_id:
*                type: integer
*                example: 27
*              flight_id:
*                type: integer
*                example: 1
*            xml:
*              name: role_admins
*/