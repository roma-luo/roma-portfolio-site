"use client";

import { useEffect } from "react";

const SESSION_KEY = "vt_fired";

export default function VisitorTracker() {
    useEffect(() => {
        // Only fire once per browser session
        if (sessionStorage.getItem(SESSION_KEY)) return;
        sessionStorage.setItem(SESSION_KEY, "1");

        fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ua: navigator.userAgent }),
        }).catch(() => {
            // fail silently — visitor should never know
        });
    }, []);

    return null; // invisible — no UI rendered
}
