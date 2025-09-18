'use client'
import * as React from 'react';

interface BoundaryProps {
    children: React.ReactNode;
    fallback: React.ReactNode;
}

export class ErrorBoundary extends React.Component<BoundaryProps, { hasError: boolean }> {
    constructor(props: BoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(err: Error) {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return this.props.fallback;
        }

        return this.props.children;
    }
}