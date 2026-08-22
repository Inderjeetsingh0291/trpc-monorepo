import UserService from "./user/index";
import FormService from "./form/index";
import FormFieldService from "./form-field/index";
import FormSubmissionService from "./form-submission/index";
import EmailService from "./email/index";

export const userService = new UserService();
export const formService = new FormService();
export const formFieldService = new FormFieldService();
export const formSubmissionService = new FormSubmissionService();
export const emailService = new EmailService();
