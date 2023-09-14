export interface Order {
    amount: number;
    status: number;
}

export interface orders {
    orders: Order[];
}

export interface changeOrderDisplay {
    div: HTMLDivElement;
    name: HTMLLabelElement;
    amount: HTMLInputElement;
    status: HTMLSelectElement;
    delete: HTMLInputElement;
}