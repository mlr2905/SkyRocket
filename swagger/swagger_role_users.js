
//categories
/**
 * @swagger
 * tags:
 *   name: role_users
 *   description: The role_users managing API
 */
/**
 * @swagger
 * tags:
 *   name: role_airlines
 *   description: The role_airlines managing API
 */
/**
 * @swagger
 * tags:
 *   name: role_admins
 *   description: The role_admins managing API
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
 *     tags: [role_users]
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
 * /role_users/users/search:  # This endpoint is likely for searching users
 *   get:
 *     summary: Search users by role or other criteria
 *     tags: [role_users]
 *     description: Search for users based on provided criteria. Requires authentication.
 *     parameters:
 *       - in: query  # Search parameters likely go in query string, not path
 *         name: id/username/email/password  # Add optional role filter parameter (example)
 *         description: (Optional) Filter users by assigned role name.
 *         type: string
 *       # You can add other search parameters here
 *     security:
 *       - CustomAuth: []
 *     responses:
 *       '200':
 *         description: Successful response with matching user details.
 *         content:
 *           application/json:
 *             schema:
 *               type: array  # Response returns an array of users
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 *                   id:  # Assuming user object has a id property
 *                     type: number
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
 * /role_users/users/{id}:
 *   put:
 *     summary: Update the user by the ID
 *     tags: [role_users]
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
 *     tags: [role_users]
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
 *     tags: [role_users]
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
 *     tags: [role_users]
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
 *     tags: [role_users]
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
 *     tags: [role_users]
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

//role_users/flights

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
 * /role_users/flights:
 *   get:
 *     summary: Get all flights
 *     tags: [role_users]
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
 * /role_users/flights/{id}:
 *   get:
 *     summary: Get a flight by ID
 *     tags: [role_users]
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

//role_users/tickets


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
 * /role_users/tickets:
 *   post:
 *     summary: Create a new ticket
 *     tags: [role_users]
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
 * /role_users/passengers:
 *   post:
 *     summary: Create a new passenger
 *     tags: [role_users]
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
*      role_users:
*        type: object
*        required:
*          - users
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
*              name: role_users
*/