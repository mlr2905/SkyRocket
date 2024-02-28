
//categories


/**
 * @swagger
 * tags:
 *   name: role_admins
 *   description: The role_admins managing API
 */


//role_admins/admins



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
*/