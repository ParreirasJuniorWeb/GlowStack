import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    textBtn?: ReactNode;
    className?: string;
    children?: ReactNode;
}

const Button = ({ children, textBtn, className, type = "button", ...props }: ButtonProps) => {
    return (
        <button
            type={type}
            {...props}
            className={`btn-grad ${className ? ` ${className}` : ""}`}
        >
            {children ?? textBtn}
        </button>
    );
};

export default Button;