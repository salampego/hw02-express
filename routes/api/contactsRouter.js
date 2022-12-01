const express = require("express");
const {
  getContactList,
  addContactById,
  deleteContactById,
  getContactsById,
  updateContactById,

  updateStatusContactById,
} = require("../../controllers/contactsController");
const asyncWrapper = require("../../helpers/apiHelpers");
const { validation } = require("../../middlewares/validationBody");
const {
  addPostSchema,
  updatePutSchema,
  updateStatusSchema,
} = require("../../schemas/contactSchema");

const router = express.Router();

router.get("/", asyncWrapper(getContactList));

router.get("/:contactId", asyncWrapper(getContactsById));

router.post("/", validation(addPostSchema), asyncWrapper(addContactById));

router.delete("/:contactId", asyncWrapper(deleteContactById));

router.put(
  "/:contactId",
  validation(updatePutSchema),
  asyncWrapper(updateContactById)
);

router.patch(
  "/:contactId/favorite",
  validation(updateStatusSchema),
  asyncWrapper(updateStatusContactById)
);

module.exports = router;
