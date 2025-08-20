import React from 'react'

export default function Button({ className = '', ...props }) {
    return (
        <button
            className={`inline-flex items-center justify-center rounded-lg px-3 py-2 ${className}`}
            {...props}
        />
    )
}


