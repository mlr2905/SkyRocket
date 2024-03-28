
//categories

/**
 * @swagger
 * tags:
 *   name: role_airlines
 *   description: The role_airlines managing API
 */


//role_airlines/



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
 *           type: integer
 *     security:
 *       - CustomAuth: []
 *     responses:
 *       '201':
 *         description: Created 🆗
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
 *                       example: tset_swagger
 *                       description: The username of the user.
 *                     password:
 *                       type: string
 *                       example: Aasj212
 *                       description: The password of the user.
 *                     email:
 *                       type: string
 *                       example: tset_swagger@gmail.com
 *                       description: The email of the user.
 *       '403':
 *         description: Forbidden.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   example: Access denied, you do not have permission to access the requested Id '{id}'.
 *       '404':
 *         description: Not Found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   example: The id {id} you specified does not exist in the system
 *       '503':
 *         description: Service Unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   example: the service is temporarily unavailable '{error}'.
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
 *       '201':
 *         description: Created 🆗
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
 *                       example: tset_swagger
 *                       description: The username of the user.
 *                     password:
 *                       type: string
 *                       example: Aasj212
 *                       description: The password of the user.
 *                     email:
 *                       type: string
 *                       example: tset_swagger@gmail.com
 *                       description: The email of the user.
 *       '403':
 *         description: Forbidden.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   example: Access denied, you do not have permission to access the requested Id '{id}'.
 *       '404':
 *         description: Not Found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   example: The id {id} you specified does not exist in the system.
 *       '503':
 *         description: Service Unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   example: the service is temporarily unavailable '{error}'.
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
 *       description: "⚠⚠⚠Please note: Either password or email can be updated, not both at the same time.!!!⚠⚠⚠"
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: 
 *               username:
 *                 type: string
 *                 example: tset_swagger_put
 *                 description: The username of the user.
 *               password:
 *                 type: string
 *                 example: 'null'
 *                 description: The password of the user.
 *               email:
 *                 type: string
 *                 example: tset_swagger_put@gmail.com
 *                 description: The email of the user.
 *     responses:
 *       '200':
 *         description: 🆗
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  example:
 *                    type: string
 *                    example: email ${email} successfully updated
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
 *         description: Conflict
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: The email {email} already exists
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
 * /:
 *   post:
 *     summary: 
 *     tags: [role_airlines]
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
 * /role_airlines/airlines:
 *   post:
 *     summary: Create a new user_airlines
 *     tags: [role_airlines]
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
 * /role_airlines/airlines/{id}:
 *   get:
 *     summary: Get a user_airline by ID
 *     tags: [role_airlines]
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
 * /role_airlines/airlines/{id}:
 *   put:
 *     summary: Update the user_airline by the ID
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
 * //:
 *   post:
 *     summary: 
 *     tags: [role_airlines]
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
 * /role_airlines/airline_id/{id}:
 *   get:
 *     summary: Get flights by airline_id
 *     tags: [role_airlines]
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
 * /role_airlines/flights/{id}:
 *   get:
 *     summary: Get a user_airline by ID
 *     tags: [role_airlines]
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
 * components:
 *   securitySchemes:
 *     CustomAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 *       description: Enter API key as "Bearer <API_KEY>"
 *
 * /role_airlines/flights:
 *   post:
 *     summary: Create a new flight
 *     tags: [role_airlines]
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
 *       '400':
 *         description: Bad request. Ensure all required fields are provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flight:
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
 * /role_airlines/flights/{id}:
 *   put:
 *     summary: Update the flight by the ID
 *     tags: [role_airlines]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The flights id
 *     security:
 *       - CustomAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/flights'
 *     responses:
 *       200:
 *         description: 🆗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/flights'
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
 * /role_airlines/flights/{id}:
 *   delete:
 *     summary: Delete an flight by ID
 *     tags: [role_airlines]
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
*  @swagger
*  components:
*    schemas:
*      role_airlines:
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
*        xml:
*          name: role_airlines
*/
