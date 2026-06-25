import { useState } from "react";
import toast from "react-hot-toast";

import axiosInstance from "../Helpers/axiosInstance";
import { isEmail } from "../Helpers/regexMatcher";

function Contact() {

    const [userInput, setUserInput] = useState({
        name: "",
        email: "",
        message: "",
    })

    function handleInputChange(e) {
        const { name, value } = e.target;
        setUserInput({
            ...userInput,
            [name]: value
        })
    }

    async function onFormSubmit(e) {
        e.preventDefault();
        if (!userInput.email || !userInput.name || !userInput.message) {
            toast.error("All fields are mandatory");
            return;
        }
        if (!isEmail(userInput.email)) {
            toast.error("Invalid Email")
            return;
        }
        try {
            const response = axiosInstance.post("/contact", userInput)
            toast.promise(response, {
                loading: "Submitting your message....",
                success: "Form submitted successfully",
                error: "Failed to submit the form"
            })
            const contactResponse = await response;
            if (contactResponse?.data?.success) {
                setUserInput({
                    name: "",
                    email: "",
                    message: ""
                })
            }
        } catch (error) {
            toast.error("Operation failed......")
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[90vh] px-4">
            {/* Form Container: Thay bóng đổ đen bằng viền và shadow chuẩn, bỏ text-white */}
            <form
                noValidate
                onSubmit={onFormSubmit}
                className="flex flex-col items-center justify-center gap-5 p-8 rounded-2xl bg-base-100 text-base-content shadow-xl border border-base-200 w-full sm:w-[26rem] transition-all"
            >
                <h1 className="text-3xl font-bold text-primary mb-2">
                    Contact Us
                </h1>

                {/* Input Name */}
                <div className="flex flex-col w-full gap-2">
                    <label htmlFor="name" className="font-semibold text-base-content/80">Name</label>
                    <input
                        className="bg-base-100 text-base-content border border-base-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        type="text"
                        name="name"
                        id="name"
                        placeholder="Enter your name..."
                        onChange={handleInputChange}
                        value={userInput.name}
                    />
                </div>

                {/* Input Email */}
                <div className="flex flex-col w-full gap-2">
                    <label htmlFor="email" className="font-semibold text-base-content/80">Email</label>
                    <input
                        className="bg-base-100 text-base-content border border-base-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Enter your email..."
                        onChange={handleInputChange}
                        value={userInput.email}
                    />
                </div>

                {/* Input Message */}
                <div className="flex flex-col w-full gap-2">
                    <label htmlFor="message" className="font-semibold text-base-content/80">Message</label>
                    <textarea
                        className="bg-base-100 text-base-content border border-base-300 px-4 py-2 rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        name="message"
                        id="message"
                        placeholder="How can we help you?"
                        onChange={handleInputChange}
                        value={userInput.message}
                    />
                </div>
                
                {/* Submit Button */}
                <button 
                    type="submit" 
                    className="btn btn-primary w-full mt-4 text-lg border-none"
                >
                    Send Message
                </button>
            </form>
        </div>
    )
}

export default Contact;