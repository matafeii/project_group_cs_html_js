import Accordion from "accordion-js";
import "accordion-js/dist/accordion.min.css";



new Accordion(".faq-list", {
    showMultiple: false,
    duration: 600,
    triggerClass: "faq-btn",
    elementClass: "faq-item",
    panelClass: "answer-text",
})