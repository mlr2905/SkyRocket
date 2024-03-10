
//categories

/**
 * @swagger
 * tags:
 *   name: role_airlines
 *   description: The role_airlines managing API
 */



//role_airlines/airlines




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