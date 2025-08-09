const { DataTypes } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
      tagName: {
          type: DataTypes.STRING,
          allowNull: false,

      }
  });

  /**
   * @swagger
   * components:
   *   schemas:
   *     TagWithUsers:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *           description: The auto-generated ID of the tag.
   *           example: 1
   *         tagName:
   *           type: string
   *           description: The name of the tag.
   *           example: Technology
   *         createdAt:
   *           type: string
   *           format: date-time
   *           description: The date and time when the tag was created.
   *           example: 2023-04-01T10:00:00Z
   *         updatedAt:
   *           type: string
   *           format: date-time
   *           description: The date and time when the tag was last updated.
   *           example: 2023-04-01T10:00:00Z
   *         users:
   *           type: array
   *           description: List of users associated with this tag.
   *           items:
   *             $ref: '#/components/schemas/User'
   *       example:
   *         id: 1
   *         tagName: Technology
   *         createdAt: 2023-04-01T10:00:00Z
   *         updatedAt: 2023-04-01T10:00:00Z
   *         users:
   *           - id: 101
   *             email: user1@example.com
   *             firstName: John
   *             lastName: Doe
   *             phone: "123-456-7890"
   *             comment: ""
   *             title: "Software Engineer"
   *             emailStatus: true
   *             createdAt: 2023-04-01T09:00:00Z
   *             updatedAt: 2023-04-01T09:00:00Z
   */
  return Tag;
};