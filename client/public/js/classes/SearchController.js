// File: SearchController.js
import * as C from '../utils/constants.js';
import * as SearchService from '../services/searchService.js';
import { SearchUIHandler } from './SearchUIHandler.js';

const PLANE_LAYOUTS = {
    // Plane ID 1
    1: [
        { id: 1, name: "1A" }, { id: 2, name: "1B" }, { id: 3, name: "1C" }, { id: 4, name: "1D" },
        { id: 5, name: "2A" }, { id: 6, name: "2B" }, { id: 7, name: "2C" }, { id: 8, name: "2D" },
        { id: 9, name: "3A" }, { id: 10, name: "3B" }, { id: 11, name: "3C" }, { id: 12, name: "3D" },
        { id: 13, name: "4A" }, { id: 14, name: "4B" }, { id: 15, name: "4C" }, { id: 16, name: "4D" },
        { id: 17, name: "4E" }, { id: 18, name: "4F" },
        { id: 19, name: "5A" }, { id: 20, name: "5B" }, { id: 21, name: "5C" }, { id: 22, name: "5D" },
        { id: 23, name: "5E" }, { id: 24, name: "5F" },
        { id: 25, name: "6A" }, { id: 26, name: "6B" }, { id: 27, name: "6C" }, { id: 28, name: "6D" },
        { id: 29, name: "6E" }, { id: 30, name: "6F" },
        { id: 31, name: "7A" }, { id: 32, name: "7B" }, { id: 33, name: "7C" }, { id: 34, name: "7D" },
        { id: 35, name: "7E" }, { id: 36, name: "7F" },
        { id: 37, name: "8A" }, { id: 38, name: "8B" }, { id: 39, name: "8C" }, { id: 40, name: "8D" },
        { id: 41, name: "8E" }, { id: 42, name: "8F" },
        { id: 43, name: "9A" }, { id: 44, name: "9B" }, { id: 45, name: "9C" }, { id: 46, name: "9D" },
        { id: 47, name: "9E" }, { id: 48, name: "9F" },
        { id: 49, name: "10A" }, { id: 50, name: "10B" }, { id: 51, name: "10C" }, { id: 52, name: "10D" },
        { id: 53, name: "10E" }, { id: 54, name: "10F" },
        { id: 55, name: "11A" }, { id: 56, name: "11B" }, { id: 57, name: "11C" }, { id: 58, name: "11D" },
        { id: 59, name: "11E" }, { id: 60, name: "11F" },
        { id: 61, name: "12A" }, { id: 62, name: "12B" }, { id: 63, name: "12C" }, { id: 64, name: "12D" },
        { id: 65, name: "12E" }, { id: 66, name: "12F" },
        { id: 67, name: "13A" }, { id: 68, name: "13B" }, { id: 69, name: "13C" }, { id: 70, name: "13D" },
        { id: 71, name: "13E" }, { id: 72, name: "13F" },
        { id: 73, name: "14A" }, { id: 74, name: "14B" }, { id: 75, name: "14C" }, { id: 76, name: "14D" },
        { id: 77, name: "14E" }, { id: 78, name: "14F" },
        { id: 79, name: "15A" }, { id: 80, name: "15B" }, { id: 81, name: "15C" }, { id: 82, name: "15D" },
        { id: 83, name: "15E" }, { id: 84, name: "15F" },
        { id: 85, name: "16A" }, { id: 86, name: "16B" }, { id: 87, name: "16C" }, { id: 88, name: "16D" },
        { id: 89, name: "16E" }, { id: 90, name: "16F" },
        { id: 91, name: "17A" }, { id: 92, name: "17B" }, { id: 93, name: "17C" }, { id: 94, name: "17D" },
        { id: 95, name: "17E" }, { id: 96, name: "17F" },
        { id: 97, name: "18A" }, { id: 98, name: "18B" }, { id: 99, name: "18C" }, { id: 100, name: "18D" },
        { id: 101, name: "18E" }, { id: 102, name: "18F" },
        { id: 103, name: "19A" }, { id: 104, name: "19B" }, { id: 105, name: "19C" }, { id: 106, name: "19D" },
        { id: 107, name: "19E" }, { id: 108, name: "19F" },
        { id: 109, name: "20A" }, { id: 110, name: "20B" }, { id: 111, name: "20C" }, { id: 112, name: "20D" },
        { id: 113, name: "20E" }, { id: 114, name: "20F" },
        { id: 115, name: "21A" }, { id: 116, name: "21B" }, { id: 117, name: "21C" }, { id: 118, name: "21D" },
        { id: 119, name: "21E" }, { id: 120, name: "21F" },
        { id: 121, name: "22A" }, { id: 122, name: "22B" }, { id: 123, name: "22C" }, { id: 124, name: "22D" },
        { id: 125, name: "22E" }, { id: 126, name: "22F" },
        { id: 127, name: "23A" }, { id: 128, name: "23B" }, { id: 129, name: "23C" }, { id: 130, name: "23D" },
        { id: 131, name: "23E" }, { id: 132, name: "23F" },
        { id: 133, name: "24A" }, { id: 134, name: "24B" }, { id: 135, name: "24C" }, { id: 136, name: "24D" },
        { id: 137, name: "24E" }, { id: 138, name: "24F" },
        { id: 139, name: "25A" }, { id: 140, name: "25B" }, { id: 141, name: "25C" }, { id: 142, name: "25D" },
        { id: 143, name: "25E" }, { id: 144, name: "25F" }
    ],
    // Plane ID 2
    2: [
        { id: 145, name: "1A" }, { id: 146, name: "1B" }, { id: 147, name: "1C" }, { id: 148, name: "1D" },
        { id: 149, name: "2A" }, { id: 150, name: "2B" }, { id: 151, name: "2C" }, { id: 152, name: "2D" },
        { id: 153, name: "3A" }, { id: 154, name: "3B" }, { id: 155, name: "3C" }, { id: 156, name: "3D" },
        { id: 157, name: "4A" }, { id: 158, name: "4B" }, { id: 159, name: "4C" }, { id: 160, name: "4D" },
        { id: 161, name: "7A" }, { id: 162, name: "7B" }, { id: 163, name: "7C" }, { id: 164, name: "7D" },
        { id: 165, name: "7E" }, { id: 166, name: "7F" },
        { id: 167, name: "8A" }, { id: 168, name: "8B" }, { id: 169, name: "8C" }, { id: 170, name: "8D" },
        { id: 171, name: "8E" }, { id: 172, name: "8F" },
        { id: 173, name: "9A" }, { id: 174, name: "9B" }, { id: 175, name: "9C" }, { id: 176, name: "9D" },
        { id: 177, name: "9E" }, { id: 178, name: "9F" },
        { id: 179, name: "10A" }, { id: 180, name: "10B" }, { id: 181, name: "10C" }, { id: 182, name: "10D" },
        { id: 183, name: "10E" }, { id: 184, name: "10F" },
        { id: 185, name: "11A" }, { id: 186, name: "11B" }, { id: 187, name: "11C" }, { id: 188, name: "11D" },
        { id: 189, name: "11E" }, { id: 190, name: "11F" },
        { id: 191, name: "12A" }, { id: 192, name: "12B" }, { id: 193, name: "12C" }, { id: 194, name: "12D" },
        { id: 195, name: "12E" }, { id: 196, name: "12F" },
        { id: 197, name: "13A" }, { id: 198, name: "13B" }, { id: 199, name: "13C" }, { id: 200, name: "13D" },
        { id: 201, name: "13E" }, { id: 202, name: "13F" },
        { id: 203, name: "14A" }, { id: 204, name: "14B" }, { id: 205, name: "14C" }, { id: 206, name: "14D" },
        { id: 207, name: "14E" }, { id: 208, name: "14F" },
        { id: 209, name: "15A" }, { id: 210, name: "15B" }, { id: 211, name: "15C" }, { id: 212, name: "15D" },
        { id: 213, name: "15E" }, { id: 214, name: "15F" },
        { id: 215, name: "16A" }, { id: 216, name: "16B" }, { id: 217, name: "16C" }, { id: 218, name: "16D" },
        { id: 219, name: "16E" }, { id: 220, name: "16F" },
        { id: 221, name: "17A" }, { id: 222, name: "17B" }, { id: 223, name: "17C" }, { id: 224, name: "17D" },
        { id: 225, name: "17E" }, { id: 226, name: "17F" },
        { id: 227, name: "18A" }, { id: 228, name: "18B" }, { id: 229, name: "18C" }, { id: 230, name: "18D" },
        { id: 231, name: "18E" }, { id: 232, name: "18F" },
        { id: 233, name: "19A" }, { id: 234, name: "19B" }, { id: 235, name: "19C" }, { id: 236, name: "19D" },
        { id: 237, name: "19E" }, { id: 238, name: "19F" },
        { id: 239, name: "20A" }, { id: 240, name: "20B" }, { id: 241, name: "20C" }, { id: 242, name: "20D" },
        { id: 243, name: "20E" }, { id: 244, name: "20F" },
        { id: 245, name: "21A" }, { id: 246, name: "21B" }, { id: 247, name: "21C" }, { id: 248, name: "21D" },
        { id: 249, name: "21E" }, { id: 250, name: "21F" },
        { id: 251, name: "22A" }, { id: 252, name: "22B" }, { id: 253, name: "22C" }, { id: 254, name: "22D" },
        { id: 255, name: "22E" }, { id: 256, name: "22F" },
        { id: 257, name: "23A" }, { id: 258, name: "23B" }, { id: 259, name: "23C" }, { id: 260, name: "23D" },
        { id: 261, name: "23E" }, { id: 262, name: "23F" },
        { id: 263, name: "24A" }, { id: 264, name: "24B" }, { id: 265, name: "24C" }, { id: 266, name: "24D" },
        { id: 267, name: "24E" }, { id: 268, name: "24F" },
        { id: 269, name: "25A" }, { id: 270, name: "25B" }, { id: 271, name: "25C" }, { id: 272, name: "25D" },
        { id: 273, name: "25E" }, { id: 274, name: "25F" },
        { id: 275, name: "26A" }, { id: 276, name: "26B" }, { id: 277, name: "26C" }, { id: 278, name: "26D" },
        { id: 279, name: "26E" }, { id: 280, name: "26F" },
        { id: 281, name: "27A" }, { id: 282, name: "27B" }, { id: 283, name: "27C" }, { id: 284, name: "27D" },
        { id: 285, name: "27E" }, { id: 286, name: "27F" },
        { id: 287, name: "28A" }, { id: 288, name: "28B" }, { id: 289, name: "28C" }, { id: 290, name: "28D" },
        { id: 291, name: "28E" }, { id: 292, name: "28F" },
        { id: 293, name: "29A" }, { id: 294, name: "29B" }, { id: 295, name: "29C" }, { id: 296, name: "29D" },
        { id: 297, name: "29E" }, { id: 298, name: "29F" },
        { id: 299, name: "30A" }, { id: 300, name: "30B" }, { id: 301, name: "30C" }, { id: 302, name: "30D" },
        { id: 303, name: "30E" }, { id: 304, name: "30F" },
        { id: 305, name: "31A" }, { id: 306, name: "31B" }, { id: 307, name: "31C" }, { id: 308, name: "31D" },
        { id: 309, name: "31E" }, { id: 310, name: "31F" },
        { id: 311, name: "32A" }, { id: 312, name: "32B" }, { id: 313, name: "32C" }, { id: 314, name: "32D" },
        { id: 315, name: "32E" }, { id: 316, name: "32F" },
        { id: 317, name: "33A" }, { id: 318, name: "33B" }, { id: 319, name: "33C" }, { id: 320, name: "33D" },
        { id: 321, name: "33E" }, { id: 322, name: "33F" },
        { id: 323, name: "34A" }, { id: 324, name: "34B" }, { id: 325, name: "34C" }, { id: 326, name: "34D" },
        { id: 327, name: "34E" }, { id: 328, name: "34F" },
        { id: 329, name: "35A" }, { id: 330, name: "35B" }, { id: 331, name: "35C" }, { id: 332, name: "35D" },
        { id: 333, name: "35E" }, { id: 334, name: "35F" },
        { id: 335, name: "36A" }, { id: 336, name: "36B" }, { id: 337, name: "36C" }, { id: 338, name: "36D" },
        { id: 339, name: "36E" }, { id: 340, name: "36F" },
        { id: 341, name: "37A" }, { id: 342, name: "37B" }, { id: 343, name: "37C" }, { id: 344, name: "37D" },
        { id: 345, name: "37E" }, { id: 346, name: "37F" },
        { id: 347, name: "38A" }, { id: 348, name: "38B" }, { id: 349, name: "38C" }, { id: 350, name: "38D" },
        { id: 351, name: "38E" }, { id: 352, name: "38F" }
    ],
    // Plane ID 3
    3: [
        { id: 353, name: "1A" }, { id: 354, name: "1B" }, { id: 355, name: "1C" }, { id: 356, name: "1D" },
        { id: 357, name: "2A" }, { id: 358, name: "2B" }, { id: 359, name: "2C" }, { id: 360, name: "2D" },
        { id: 361, name: "7A" }, { id: 362, name: "7B" }, { id: 363, name: "7C" }, { id: 364, name: "7D" },
        { id: 365, name: "7E" }, { id: 366, name: "7F" }, { id: 367, name: "7G" },
        { id: 368, name: "8A" }, { id: 369, name: "8B" }, { id: 370, name: "8C" }, { id: 371, name: "8D" },
        { id: 372, name: "8E" }, { id: 373, name: "8F" }, { id: 374, name: "8G" },
        { id: 375, name: "9A" }, { id: 376, name: "9B" }, { id: 377, name: "9C" }, { id: 378, name: "9D" },
        { id: 379, name: "9E" }, { id: 380, name: "9F" }, { id: 381, name: "9G" },
        { id: 382, name: "10A" }, { id: 383, name: "10B" }, { id: 384, name: "10C" }, { id: 385, name: "10D" },
        { id: 386, name: "10E" }, { id: 387, name: "10F" }, { id: 388, name: "10G" },
        { id: 389, name: "11A" }, { id: 390, name: "11B" }, { id: 391, name: "11C" }, { id: 392, name: "11D" },
        { id: 393, name: "11E" }, { id: 394, name: "11F" }, { id: 395, name: "11G" },
        { id: 396, name: "12A" }, { id: 397, name: "12B" }, { id: 398, name: "12C" }, { id: 399, name: "12D" },
        { id: 400, name: "12E" }, { id: 401, name: "12F" }, { id: 402, name: "12G" },
        { id: 403, name: "13A" }, { id: 404, name: "13B" }, { id: 405, name: "13C" }, { id: 406, name: "13D" },
        { id: 407, name: "13E" }, { id: 408, name: "13F" }, { id: 409, name: "13G" },
        { id: 410, name: "14A" }, { id: 411, name: "14B" }, { id: 412, name: "14C" }, { id: 413, name: "14D" },
        { id: 414, name: "14E" }, { id: 415, name: "14F" }, { id: 416, name: "14G" },
        { id: 417, name: "15A" }, { id: 418, name: "15B" }, { id: 419, name: "15C" }, { id: 420, name: "15D" },
        { id: 421, name: "15E" }, { id: 422, name: "15F" }, { id: 423, name: "15G" },
        { id: 424, name: "28A" }, { id: 425, name: "28B" }, { id: 426, name: "28C" }, { id: 427, name: "28D" },
        { id: 428, name: "28E" }, { id: 429, name: "28F" }, { id: 430, name: "28G" }, { id: 431, name: "28H" },
        { id: 432, name: "28j" },
        { id: 433, name: "29A" }, { id: 434, name: "29B" }, { id: 435, name: "29C" }, { id: 436, name: "29D" },
        { id: 437, name: "29E" }, { id: 438, name: "29F" }, { id: 439, name: "29G" }, { id: 440, name: "29H" },
        { id: 441, name: "29j" },
        { id: 442, name: "30A" }, { id: 443, name: "30B" }, { id: 444, name: "30C" }, { id: 445, name: "30D" },
        { id: 446, name: "30E" }, { id: 447, name: "30F" }, { id: 448, name: "30G" }, { id: 449, name: "30H" },
        { id: 450, name: "30j" },
        { id: 451, name: "31A" }, { id: 452, name: "31B" }, { id: 453, name: "31C" }, { id: 454, name: "31D" },
        { id: 455, name: "31E" }, { id: 456, name: "31F" }, { id: 457, name: "31G" }, { id: 458, name: "31H" },
        { id: 459, name: "31j" },
        { id: 460, name: "32A" }, { id: 461, name: "32B" }, { id: 462, name: "32C" }, { id: 463, name: "32D" },
        { id: 464, name: "32E" }, { id: 465, name: "32F" }, { id: 466, name: "32G" }, { id: 467, name: "32H" },
        { id: 468, name: "32j" },
        { id: 469, name: "33A" }, { id: 470, name: "33B" }, { id: 471, name: "33C" }, { id: 472, name: "33D" },
        { id: 473, name: "33E" }, { id: 474, name: "33F" }, { id: 475, name: "33G" }, { id: 476, name: "33H" },
        { id: 477, name: "33j" },
        { id: 478, name: "34A" }, { id: 479, name: "34B" }, { id: 480, name: "34C" }, { id: 481, name: "34D" },
        { id: 482, name: "34E" }, { id: 483, name: "34F" }, { id: 484, name: "34G" }, { id: 485, name: "34H" },
        { id: 486, name: "34j" },
        { id: 487, name: "35A" }, { id: 488, name: "35B" }, { id: 489, name: "35C" }, { id: 490, name: "35D" },
        { id: 491, name: "35E" }, { id: 492, name: "35F" }, { id: 493, name: "35G" }, { id: 494, name: "35H" },
        { id: 495, name: "35j" },
        { id: 496, name: "36A" }, { id: 497, name: "36B" }, { id: 498, name: "36C" }, { id: 499, name: "36D" },
        { id: 500, name: "36E" }, { id: 501, name: "36F" }, { id: 502, name: "36G" }, { id: 503, name: "36H" },
        { id: 504, name: "36j" },
        { id: 505, name: "37A" }, { id: 506, name: "37B" }, { id: 507, name: "37C" }, { id: 508, name: "37D" },
        { id: 509, name: "37E" }, { id: 510, name: "37F" }, { id: 511, name: "37G" }, { id: 512, name: "37H" },
        { id: 513, name: "37j" },
        { id: 514, name: "38A" }, { id: 515, name: "38B" }, { id: 516, name: "38C" }, { id: 517, name: "38D" },
        { id: 518, name: "38E" }, { id: 519, name: "38F" }, { id: 520, name: "38G" }, { id: 521, name: "38H" },
        { id: 522, name: "38j" },
        { id: 523, name: "39A" }, { id: 524, name: "39B" }, { id: 525, name: "39C" }, { id: 526, name: "39D" },
        { id: 527, name: "39E" }, { id: 528, name: "39F" }, { id: 529, name: "39G" }, { id: 530, name: "39H" },
        { id: 531, name: "39j" },
        { id: 532, name: "40A" }, { id: 533, name: "40B" }, { id: 534, name: "40C" }, { id: 535, name: "40D" },
        { id: 536, name: "40E" }, { id: 537, name: "40F" }, { id: 538, name: "40G" }, { id: 539, name: "40H" },
        { id: 540, name: "40j" },
        { id: 541, name: "41A" }, { id: 542, name: "41B" }, { id: 543, name: "41C" }, { id: 544, name: "41G" },
        { id: 545, name: "41H" }, { id: 546, name: "41j" },
        { id: 547, name: "42A" }, { id: 548, name: "42B" }, { id: 549, name: "42C" }, { id: 550, name: "42D" },
        { id: 551, name: "42E" }, { id: 552, name: "42F" }, { id: 553, name: "42G" }, { id: 554, name: "42H" },
        { id: 555, name: "42j" },
        { id: 556, name: "43A" }, { id: 557, name: "43B" }, { id: 558, name: "43C" }, { id: 559, name: "43D" },
        { id: 560, name: "43E" }, { id: 561, name: "43F" }, { id: 562, name: "43G" }, { id: 563, name: "43H" },
        { id: 564, name: "43j" },
        { id: 565, name: "44A" }, { id: 566, name: "44B" }, { id: 567, name: "44C" }, { id: 568, name: "44D" },
        { id: 569, name: "44E" }, { id: 570, name: "44F" }, { id: 571, name: "44G" }, { id: 572, name: "44H" },
        { id: 573, name: "44j" },
        { id: 574, name: "45A" }, { id: 575, name: "45B" }, { id: 576, name: "45C" }, { id: 577, name: "45D" },
        { id: 578, name: "45E" }, { id: 579, name: "45F" }, { id: 580, name: "45G" }, { id: 581, name: "45H" },
        { id: 582, name: "45j" },
        { id: 583, name: "46A" }, { id: 584, name: "46B" }, { id: 585, name: "46C" }, { id: 586, name: "46D" },
        { id: 587, name: "46E" }, { id: 588, name: "46F" }, { id: 589, name: "46G" }, { id: 590, name: "46H" },
        { id: 591, name: "46j" },
        { id: 592, name: "47A" }, { id: 593, name: "47B" }, { id: 594, name: "47C" }, { id: 595, name: "47D" },
        { id: 596, name: "47E" }, { id: 597, name: "47F" }, { id: 598, name: "47G" }, { id: 599, name: "47H" },
        { id: 600, name: "47j" },
        { id: 601, name: "48A" }, { id: 602, name: "48B" }, { id: 603, name: "48C" }, { id: 604, name: "48D" },
        { id: 605, name: "48E" }, { id: 606, name: "48F" }, { id: 607, name: "48G" }, { id: 608, name: "48H" },
        { id: 609, name: "48j" },
        { id: 610, name: "49A" }, { id: 611, name: "49B" }, { id: 612, name: "49C" }, { id: 613, name: "49D" },
        { id: 614, name: "49E" }, { id: 615, name: "49F" }, { id: 616, name: "49G" }, { id: 617, name: "49H" },
        { id: 618, name: "49j" },
        { id: 619, name: "50A" }, { id: 620, name: "50B" }, { id: 621, name: "50C" }, { id: 622, name: "50D" },
        { id: 623, name: "50E" }, { id: 624, name: "50F" }, { id: 625, name: "50G" }, { id: 626, name: "50H" },
        { id: 627, name: "50j" },
        { id: 628, name: "51A" }, { id: 629, name: "51B" }, { id: 630, name: "51C" }, { id: 631, name: "51D" },
        { id: 632, name: "51E" }, { id: 633, name: "51F" }, { id: 634, name: "51G" }, { id: 635, name: "51H" },
        { id: 636, name: "51j" },
        { id: 637, name: "52A" }, { id: 638, name: "52B" }, { id: 639, name: "52C" }, { id: 640, name: "52D" },
        { id: 641, name: "52E" }, { id: 642, name: "52F" }, { id: 643, name: "52G" },
        { id: 644, name: "53A" }, { id: 645, name: "53B" }, { id: 646, name: "53C" }, { id: 647, name: "53D" },
        { id: 648, name: "53E" }, { id: 649, name: "53F" }, { id: 650, name: "53G" }
    ]
};

export class SearchController {
    #elements = {};
    #state = {
        currentNumber: 1,
        tripType: 'round-trip',
        selectedOutboundFlight: null, // Stores the full flight object
        selectedReturnFlight: null,   // Stores the full flight object
        selectedOrigin: { id: null, name: '' },
        selectedDestination: { id: null, name: '' },
        uniqueCountriesCache: [], // Stores [{ id, name }]
        destinationsCache: []   // Stores [{ id, name }]
    };
    #ui;

    constructor() {
        this.#selectDOMElements();
        this.#ui = new SearchUIHandler(this.#elements);
        this.#attachEventListeners();
        this.#initializePage();
    }

    #selectDOMElements() {
        this.#elements = {

            logoutButton: document.getElementById('logout-button'),
            loginButton: document.getElementById('login-button'),
            signupButton: document.getElementById('signup-button'),
            deleteAccountLink: document.getElementById('delete-account-link'),
            personalAreaDropdown: document.getElementById('personal-area-dropdown'),
            searchFormGroup: document.getElementById('search-form-group'),
            flightContainer: document.querySelector('.main-container'),
            fromInput: document.getElementById('from'),
            toInput: document.getElementById('to'),
            dateRangeInput: document.getElementById('daterange'),
            numberElement: document.getElementById('number'),
            subtractButton: document.getElementById('button-subtract'),
            addButton: document.getElementById('button-add'),
            fromList: document.getElementById('from-list'),
            toList: document.getElementById('to-list'),
            loadingIcon: document.getElementById('loading-icon'),
            searchButton: document.getElementById('search'),
            outboundContainer: document.getElementById('flights-container'),
            returnContainer: document.getElementById('flights-container2'),
            outboundSection: document.getElementById('outbound'),
            returnSection: document.getElementById('return'),
            roundTripRadio: document.getElementById('trip-type-roundtrip'),
            oneWayRadio: document.getElementById('trip-type-oneway'),
            mainFlightContainer: document.querySelector('.main-container'),
            passengerDetailsSection: document.getElementById('passenger-details-section'),
            passengerFormsContainer: document.getElementById('passenger-forms-container'),
            confirmBookingButton: document.getElementById('confirm-booking-btn'),
            backToFlightsButton: document.getElementById('back-to-flights-btn'),
            seatMapModal: document.getElementById('seat-map-modal'),
            seatMapGrid: document.getElementById('seat-map-grid'),
            seatMapTitle: document.getElementById('seat-map-title'),
            confirmSeatButton: document.getElementById('confirm-seat-btn')
        };
    }

    async #initializePage() {
        this.#ui.showLoading(true);
        this.#ui.updateInputDisabledState();
        this.#ui.toggleSearchView(false);
        this.#ui.togglePassengerView(false);

        try {
            const status = await SearchService.checkActivationStatus();
            this.#ui.updateLoginStatus(status === 200);
        } catch (error) {
            console.error("Failed to check activation status:", error);
            this.#ui.updateLoginStatus(false);
        }

        try {
            this.#state.uniqueCountriesCache = await SearchService.fetchOriginCountries();
            console.log("Initialization complete. Countries loaded:", this.#state.uniqueCountriesCache.length);
        } catch (error) {
            console.error("Failed to initialize origin countries:", error);
        }

        if (typeof $ === 'function' && typeof $.fn.daterangepicker === 'function') {
            try {
                $(this.#elements.dateRangeInput).daterangepicker({
                    opens: 'left', singleDatePicker: true, autoUpdateInput: false,
                    locale: { format: "YYYY-MM-DD", cancelLabel: 'Clear' }
                });
                $(this.#elements.dateRangeInput).on('apply.daterangepicker', function (ev, picker) { $(this).val(picker.startDate.format('YYYY-MM-DD')); });
                $(this.#elements.dateRangeInput).on('cancel.daterangepicker', function (ev, picker) { $(this).val(''); });
            } catch (e) { console.error("Failed to initialize daterangepicker:", e); }
        } else { console.error('jQuery or daterangepicker plugin not loaded'); }

        this.#ui.showLoading(false);
    }

    #attachEventListeners() {
        this.#elements.logoutButton?.addEventListener('click', this.#handleLogout);
        this.#elements.loginButton?.addEventListener('click', () => { window.location.href = '/login.html'; });
        this.#elements.signupButton?.addEventListener('click', () => { window.location.href = '/registration.html'; });
        this.#elements.deleteAccountLink?.addEventListener('click', this.#handleDeleteAccount);
        this.#elements.subtractButton?.addEventListener('click', (e) => this.#handlePassengerChange(e, 'subtract'));
        this.#elements.addButton?.addEventListener('click', (e) => this.#handlePassengerChange(e, 'add'));
        this.#elements.searchButton?.addEventListener('click', this.#handleSearch);
        this.#elements.fromInput?.addEventListener('input', (e) => this.#handleFromInput(e.target.value));
        this.#elements.fromInput?.addEventListener('focus', this.#handleFromFocus);
        document.addEventListener('click', (e) => {
            if (!this.#elements.fromInput?.contains(e.target) && !this.#elements.fromList?.contains(e.target)) this.#ui.clearAutocomplete(this.#elements.fromList);
            if (!this.#elements.toInput?.contains(e.target) && !this.#elements.toList?.contains(e.target)) this.#ui.clearAutocomplete(this.#elements.toList);
        });
        this.#elements.toInput?.addEventListener('input', (e) => this.#handleToInput(e.target.value));
        this.#elements.toInput?.addEventListener('focus', this.#handleToFocus);
        this.#elements.roundTripRadio?.addEventListener('change', this.#handleTripTypeChange);
        this.#elements.oneWayRadio?.addEventListener('change', this.#handleTripTypeChange);
        this.#elements.backToFlightsButton?.addEventListener('click', this.#handleBackToFlights);
        this.#elements.confirmBookingButton?.addEventListener('click', this.#handleConfirmBooking);
        this.#elements.passengerFormsContainer?.addEventListener('click', this.#handleSelectSeatClick);
    }

    // --- Event Handlers ---
    #handleLogout = () => { alert("You have been logged out!"); this.#ui.updateLoginStatus(false); }
    // פונקציה חדשה לטיפול במחיקת חשבון
    // פונקציה חדשה לטיפול במחיקת חשבון
    #handleDeleteAccount = async (event) => {
        event.preventDefault(); // מנע מהקישור לנווט

        // 1. בקש אישור מהמשתמש (חשוב!)
        const isConfirmed = confirm("האם אתה בטוח שברצונך למחוק את החשבון? \nפעולה זו היא סופית ולא ניתן לשחזר אותה.");

        if (!isConfirmed) {
            return; // המשתמש ביטל
        }

        this.#ui.showLoading(true);

        try {
            // 2. שלח בקשת DELETE לנתיב החדש שיצרנו
            const response = await fetch('/role_users/me', {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'שגיאה במחיקת החשבון');
            }

            alert('החשבון נמחק בהצלחה. הנך מועבר לדף הבית.');
            window.location.href = '/'; 

        } catch (error) {
                        
            console.error('Delete account failed:', error.message);
            
            alert('מחיקת החשבון נכשלה. אנא פנה לשירות הלקוחות.');
            

        } finally {
            this.#ui.showLoading(false);
        }
    }
    #handlePassengerChange = (e, action) => { e.preventDefault(); if (action === 'add') this.#state.currentNumber++; else if (action === 'subtract' && this.#state.currentNumber > 1) this.#state.currentNumber--; this.#ui.updatePassengerCount(this.#state.currentNumber); }
    #handleTripTypeChange = (e) => { if (e.target.checked) { this.#state.tripType = e.target.value; console.log("Trip type set to:", this.#state.tripType); } }

    // --- Autocomplete ---
    #handleFromInput = (q) => { this.#ui.updateInputDisabledState(); const f = this.#state.uniqueCountriesCache.filter(c => c.name?.toLowerCase().includes(q.toLowerCase())); this.#ui.renderAutocompleteList(this.#elements.fromList, f.map(c => c.name), this.#handleAutocompleteSelectFrom); }
    #handleAutocompleteSelectFrom = async (n) => { if (this.#elements.fromInput) this.#elements.fromInput.value = n; const s = this.#state.uniqueCountriesCache.find(c => c.name === n); this.#state.selectedOrigin = s || { id: null, name: n }; this.#state.selectedDestination = { id: null, name: '' }; if (this.#elements.toInput) this.#elements.toInput.value = ''; this.#state.destinationsCache = []; this.#ui.updateInputDisabledState(); this.#ui.clearAutocomplete(this.#elements.fromList); await this.#handleToFocus(); this.#elements.toInput?.focus(); }
    #handleFromFocus = () => { this.#ui.renderAutocompleteList(this.#elements.fromList, this.#state.uniqueCountriesCache.map(c => c.name), this.#handleAutocompleteSelectFrom); }
    #handleToInput = (q) => { this.#ui.updateInputDisabledState(); if (!this.#state.selectedOrigin.id) return; const f = this.#state.destinationsCache.filter(d => d.name?.toLowerCase().includes(q.toLowerCase())); this.#ui.renderAutocompleteList(this.#elements.toList, f.map(c => c.name), this.#handleAutocompleteSelectTo); }
    #handleAutocompleteSelectTo = (n) => { if (this.#elements.toInput) this.#elements.toInput.value = n; const s = this.#state.destinationsCache.find(c => c.name === n); this.#state.selectedDestination = s || { id: null, name: n }; this.#ui.updateInputDisabledState(); this.#ui.clearAutocomplete(this.#elements.toList); }
    #handleToFocus = async () => { const oId = this.#state.selectedOrigin.id; if (!oId) { this.#ui.clearAutocomplete(this.#elements.toList); return; } if (this.#state.destinationsCache.length === 0) { this.#ui.showLoading(true); this.#state.destinationsCache = await SearchService.fetchDestinations(oId); this.#ui.showLoading(false); } this.#ui.renderAutocompleteList(this.#elements.toList, this.#state.destinationsCache.map(c => c.name), this.#handleAutocompleteSelectTo); }

    // --- Search ---
    #handleSearch = async () => {
        console.log("Search button clicked");
        this.#ui.toggleSearchView(true); this.#ui.togglePassengerView(false); this.#ui.showLoading(true);
        const originId = this.#state.selectedOrigin.id; const destId = this.#state.selectedDestination.id;
        const date = this.#elements.dateRangeInput?.value || null; const tripType = this.#state.tripType;
        if (!originId || !destId) { alert("Please select origin and destination."); this.#ui.showLoading(false); this.#ui.toggleSearchView(false); return; }
        try {
            let outbound = []; let returns = [];
            const outFilters = { origin_id: originId, destination_id: destId, date: date };
            if (tripType === 'round-trip') { const retFilters = { origin_id: destId, destination_id: originId, date: date };[outbound, returns] = await Promise.all([SearchService.searchFlights(outFilters), SearchService.searchFlights(retFilters)]); }
            else { outbound = await SearchService.searchFlights(outFilters); }
            console.log("Outbound flights:", outbound.length, "Return flights:", returns.length);
            this.#ui.renderFlightCards(this.#elements.outboundContainer, outbound, this.#handleFlightSelect);
            this.#ui.renderFlightCards(this.#elements.returnContainer, returns, (f, c) => this.#handleFlightSelect(f, c, 'return'));
            this.#state.selectedOutboundFlight = null; this.#state.selectedReturnFlight = null; this.#ui.selectedOutboundCard = null; this.#ui.selectedReturnCard = null;
            if (this.#elements.outboundSection) this.#elements.outboundSection.style.display = 'block'; if (this.#elements.returnSection) this.#elements.returnSection.style.display = 'none';
        } catch (error) { console.error("Flight search error:", error); } finally { this.#ui.showLoading(false); }
    }

    // --- Passenger/Seat Logic ---
    #handleFlightSelect = (flight, card, type = 'outbound') => {
        console.log(`${type} flight selected: ID ${flight.id}, Plane ID: ${flight.plane_id}`);
        this.#ui.updateSelectedCardVisuals(card, type);
        if (type === 'outbound') {
            this.#state.selectedOutboundFlight = flight;
            if (this.#state.tripType === 'round-trip') this.#ui.showReturnFlightsSection();
            else this.#showPassengerDetailsForm();
        } else {
            this.#state.selectedReturnFlight = flight;
            this.#showPassengerDetailsForm();
        }
    }

    #showPassengerDetailsForm = () => { console.log("Showing passenger details form for", this.#state.currentNumber); this.#ui.togglePassengerView(true); this.#ui.renderPassengerForms(this.#state.currentNumber, this.#state.tripType); }
    #handleBackToFlights = () => { this.#ui.togglePassengerView(false); }

    #handleSelectSeatClick = (e) => {
        const target = e.target;
        if (target.classList.contains('select-seat-btn')) {
            const pIndex = target.dataset.passengerIndex; const fType = target.dataset.flightType || 'outbound';
            const flight = (fType === 'outbound') ? this.#state.selectedOutboundFlight : this.#state.selectedReturnFlight;
            if (!flight) { alert("Error: Flight not selected"); return; }
            console.log(`Opening seat map for P${pIndex}, Type: ${fType}, Flight: ${flight.id}`);
            this.#openSeatMap(pIndex, fType, flight);
        }
    }

    #openSeatMap = async (passengerIndex, flightType, flight) => {
        this.#ui.showLoading(true);
        this.#elements.seatMapTitle.textContent = `Select Seat (Passenger ${passengerIndex}, ${flightType === 'outbound' ? 'Outbound' : 'Return'})`;
        this.#elements.seatMapGrid.innerHTML = 'Loading seat map...';

        const planeId = flight.plane_id;
        const flightIdForTaken = flight.id;

        const seatLayout = PLANE_LAYOUTS[planeId];
        if (!seatLayout) { alert(`Error: Seat layout not found for plane ID ${planeId}`); this.#elements.seatMapGrid.innerHTML = 'Error loading map layout.'; this.#ui.showLoading(false); return; }

        let allAssignments = [];
        try {
            allAssignments = await SearchService.getTakenSeats(flightIdForTaken);
        } catch (error) { console.error("Error loading seat assignments:", error); this.#elements.seatMapGrid.innerHTML = 'Error loading seat assignments.'; this.#ui.showLoading(false); return; }

        const takenSeatIds = new Set(allAssignments.filter(a => a.passenger_id !== null).map(a => a.char_id));
        console.log("Taken Seat IDs Set (Filtered):", takenSeatIds);

        this.#elements.seatMapGrid.innerHTML = '';

        seatLayout.forEach(seat => {
            const seatDiv = document.createElement('div');
            seatDiv.className = 'seat available';
            seatDiv.textContent = seat.name;
            seatDiv.dataset.seatId = seat.id;
            if (takenSeatIds.has(seat.id)) { seatDiv.classList.replace('available', 'taken'); }
            else { seatDiv.addEventListener('click', () => { this.#elements.seatMapGrid.querySelector('.seat.selected')?.classList.remove('selected'); seatDiv.classList.add('selected'); }); }
            this.#elements.seatMapGrid.appendChild(seatDiv);
        });

        this.#ui.showLoading(false);
        const modal = new bootstrap.Modal(this.#elements.seatMapModal);
        const newConfirmBtn = this.#elements.confirmSeatButton.cloneNode(true);
        this.#elements.confirmSeatButton.parentNode.replaceChild(newConfirmBtn, this.#elements.confirmSeatButton);
        this.#elements.confirmSeatButton = newConfirmBtn;

        this.#elements.confirmSeatButton.addEventListener('click', () => {
            const selected = this.#elements.seatMapGrid.querySelector('.seat.selected');
            if (selected) {
                const seatId = selected.dataset.seatId;
                const seatName = selected.textContent;
                console.log(`Seat ID ${seatId} (Name ${seatName}) confirmed for P${passengerIndex}, Type ${flightType}`);
                document.getElementById(`seat-selection-${flightType}-${passengerIndex}`).textContent = ` (${seatName})`;
                const form = document.querySelector(`.passenger-form[data-index="${passengerIndex}"]`);
                form.dataset[flightType === 'outbound' ? 'seatOutbound' : 'seatReturn'] = seatId;
                modal.hide();
            } else { alert("Please select a seat."); }
        });
        modal.show();
    }

    #handleConfirmBooking = async () => {
        console.log("Confirming booking..."); this.#ui.showLoading(true);
        const forms = this.#elements.passengerFormsContainer.querySelectorAll('.passenger-form');
        let dataToSubmit = [];
        // 1. איסוף וולידציה (כולל המרה למספר)
        for (const form of forms) {
            const idx = form.dataset.index;
            const data = {
                index: idx,
                first_name: form.querySelector('[name="first_name"]').value.trim(),
                last_name: form.querySelector('[name="last_name"]').value.trim(),
                passport_number: form.querySelector('[name="passport_number"]').value.trim(),
                date_of_birth: form.querySelector('[name="date_of_birth"]').value,
                seatOutbound: form.dataset.seatOutbound ? parseInt(form.dataset.seatOutbound, 10) : null, // ID מספרי מטבלת seats
                seatReturn: form.dataset.seatReturn ? parseInt(form.dataset.seatReturn, 10) : null     // ID מספרי מטבלת seats
            };
            if (!data.first_name || !data.last_name || !data.passport_number || !data.date_of_birth || !data.seatOutbound) { alert(`נא למלא את כל הפרטים (כולל ת. לידה וכיסא הלוך) לנוסע ${idx}.`); this.#ui.showLoading(false); return; }
            if (this.#state.tripType === 'round-trip' && !data.seatReturn) { alert(`נא לבחור כיסא חזור לנוסע ${idx}.`); this.#ui.showLoading(false); return; }
            dataToSubmit.push(data);
        }
        console.log("Data collected to submit (seat IDs are from 'seats' table):", dataToSubmit);

        try {
            const customer_id = 1;

            // 2. עיבוד כל נוסע בלולאה
            for (const data of dataToSubmit) {
                // A. יצירת נוסע
                const pRes = await fetch(C.API_PASSENGERS_URL, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        first_name: data.first_name,
                        last_name: data.last_name,
                        passport_number: data.passport_number,
                        flight_id: this.#state.selectedOutboundFlight.id,
                        date_of_birth: data.date_of_birth,
                    })
                });
                const newPassenger = await pRes.json();
                if (!pRes.ok) throw new Error(`Passenger creation failed: ${newPassenger.error || 'Unknown error'}`);
                const passengerId = newPassenger.id;

                // B. הקצאת כיסא הלוך (לטבלת chairs_taken)
                const outboundSeatId = data.seatOutbound; // ID מטבלת seats
                const cOutRes = await fetch(C.API_CHAIRS_URL, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        flight_id: this.#state.selectedOutboundFlight.id,
                        char_id: outboundSeatId, // שולחים ID מטבלת seats ל-chairs_taken
                        passenger_id: passengerId
                        // user_id: user_id
                    })
                });
                if (!cOutRes.ok) { const err = await cOutRes.json(); throw new Error(`Outbound seat assignment failed: ${err.error || cOutRes.statusText}`); }
                // כאן אין צורך לקרוא את התגובה אם לא משתמשים ב-ID ההקצאה

                // C. הקצאת כיסא חזור (לטבלת chairs_taken, אם קיים)
                let returnSeatId = null; // אתחל כ-null
                if (data.seatReturn) {
                    returnSeatId = data.seatReturn; // ID מטבלת seats
                    const cRetRes = await fetch(C.API_CHAIRS_URL, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            flight_id: this.#state.selectedReturnFlight.id,
                            char_id: returnSeatId, // שולחים ID מטבלת seats ל-chairs_taken
                            passenger_id: passengerId
                            // user_id: user_id
                        })
                    });
                    if (!cRetRes.ok) { const err = await cRetRes.json(); throw new Error(`Return seat assignment failed: ${err.error || cRetRes.statusText}`); }
                    // כאן אין צורך לקרוא את התגובה אם לא משתמשים ב-ID ההקצאה
                }

                // D. יצירת כרטיס (עם השדות החדשים)
                const tRes = await fetch(C.API_TICKETS_URL, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        flight_id: this.#state.selectedOutboundFlight.id,
                        // customer_id: customer_id,
                        passenger_id: passengerId,
                        outbound_chair_id: outboundSeatId,
                        return_chair_id: returnSeatId
                    })
                });
                if (!tRes.ok) { const err = await tRes.json(); throw new Error(`Ticket creation failed for passenger ${data.index}: ${err.error || tRes.statusText}`); }

            } // סוף הלולאה

            // 3. הצלחה
            alert("ההזמנה בוצעה בהצלחה!");
            window.location.reload();

        } catch (error) {
            console.error("Booking failed:", error);
            alert(`שגיאה בהזמנה: ${error.message}`);
        } finally {
            this.#ui.showLoading(false);
        }
    }
}