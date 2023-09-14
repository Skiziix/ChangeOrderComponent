import {IInputs, IOutputs} from "./generated/ManifestTypes";
import {Order, orders, changeOrderDisplay} from "./specialTypes/ChangeOrderControl"; // The custom / special types from ChangeOrderControl.ts

export class ChangeOrderComponent implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _container: HTMLDivElement; // The container for div elements holding input elements
    private _outerContainer: HTMLDivElement;
    private labelElement: HTMLLabelElement; // Display title of field
    private _context: ComponentFramework.Context<IInputs>; // The page context allows me to acces input and output fields
    private _notifyOutputChanged: () => void; // Will cause outputs to be updated
    private _stringData: string; // Will store stringified JSON object
    private _data: orders; // Will hold JSON object
    private _elements: changeOrderDisplay[]; // Will hold all of the elements 
    private _inputNewOrder: HTMLInputElement; // Will store the element that creates a new change order
    private _corruptData: boolean; // Will store a boolean value indicating whether or not the JSON data is corrupt


    /**
     * Empty constructor.
     */
    constructor()
    {

    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
    {
        // Add control initialization code
        this._stringData = context.parameters.OutputField.raw ? context.parameters.OutputField.raw : '{"orders": []}'; // Validating json input, if empty returns an empty string JSON object

        // This try and catch statement trys to parse the data and if it's unable it returns an empty JSON "orders" object and outputs that the data may be corrupt
        try {
            this._data = JSON.parse(this._stringData);
            this._corruptData = false;
        }
        catch {
            this._data = {orders: []};
            this._corruptData = true;
            window.alert('Warning!! Data may be corrupt in "Change Orders" column! Contact Admin to reconstruct the JSON object!');
            console.log(this._stringData);
        }
        

        // Assigning the _notifyOutputChanged attribute the notifyOutputChanged function
        this._notifyOutputChanged = notifyOutputChanged;

        // Assigning the site context to the object's _context attribute
        this._context = context;

        // Assigning the object's _elements attribute an empty list because it will be appended to if there aren't any errors in the following try statement
        this._elements = [];

        // This is going to try and create objects from the _data attribute, if unable it will notify in the console that something is wrong with the JSON object
        try {
            /* 
            Will loop through the orders node in the _data JSON structure. For each object in that node's list it will create a div with an id of the change 
            order number, name of the change order, amount of the change order, and status of the change order. 
            */
            for (let changeOrder = 0; changeOrder < this._data.orders.length; changeOrder++) {

                // This holds the Order's needed html elements.
                let tempOrder = this.createTempElements(changeOrder);


                // Pushing each element to the elements list. This list will be looped over and each div is appended to the _container attribute.
                this._elements.push(
                    {
                        div: tempOrder.div,
                        name: tempOrder.name,
                        amount: tempOrder.amount,
                        status: tempOrder.status,
                        delete: tempOrder.delete
                    }
                )
            }
        }

        // Logs a JSON error if above code doesn't work. At the time of creation that is the only reason I can see for this code to error out.
        catch {console.log(Error("Invalid JSON format or none at all."))}
        
        // Creating all the html elements
        this._outerContainer = document.createElement("div")
        this._container = document.createElement("div");
        this._container.id = "parent";
        this.labelElement = document.createElement("label");
        this._inputNewOrder = document.createElement("input");
        

        // Applying styling to the elements
        this.labelElement.setAttribute("class", "labelElement");
        this._inputNewOrder.setAttribute("id", "inputNewOrder");
        this._inputNewOrder.setAttribute("type", "submit");
        this._inputNewOrder.setAttribute("value", "+ New CO");
        this._outerContainer.setAttribute("id", "outerContainer");

        // Binding necessary event handlers
        if (this._corruptData === false){
            this._inputNewOrder.addEventListener("click", this.addChangeOrder.bind(this));
        }
        
        

        // Appending elements to the component container
        this._container.appendChild(this.labelElement);
        this._elements.forEach(element => {
            this._container.appendChild(element.div);
        });

        // Appending elements to the page container
        this._outerContainer.appendChild(this._container);
        this._outerContainer.appendChild(this._inputNewOrder);
        container.appendChild(this._outerContainer);
        

    }

    /*
    This function changes the JSON node that caused the event listener to fire and changes the number value for the amount 
    */
    public refreshAmount(element: changeOrderDisplay, evt: Event): void {

        // Because these are json objects you have to find the index of the objects in _elements by a unique property in the JSON object. In this case 
        // the map function is used to compare the div of the passed "element" to each object's div in _elements
        let index = this._elements.map(e => e.div).indexOf(element.div);

        // This acceses the orders node, and within that list the correct JSON object, and then changes the amount node based off of the value of
        // the amount input element.
        this._data.orders[index].amount = Number(this._elements[index].amount.value)
                                          ? Number(this._elements[index].amount.value)
                                          : 0;

        // Converting the JSON to a string for storage in bound column.
        this._stringData = JSON.stringify(this._data);

        // Notifies the system that an output has changed and it's time to call getOutputs()
        this._notifyOutputChanged();
    }

    /*
    This function changes the JSON node that caused the event listener to fire and changes the status 
    */
    public refreshStatus(element: changeOrderDisplay, evt: Event): void {

        // Because these are json objects you have to find the index of the objects in _elements by a unique property in the JSON object. In this case 
        // the map function is used to compare the div of the passed "element" to each object's div in _elements
        let index = this._elements.map(e => e.div).indexOf(element.div);

        /** 
        // Initialising string variable that will hold the string value of the status select input
        let updatedStatus: string;

        // Condensed If-else statements setting the updated status based off of the selected index
        if ( == 0) {updatedStatus = "Pending";}
        else if (this._elements[index].status.selectedIndex == 1) {updatedStatus = "Accepted";}
        else {updatedStatus = "Rejected";}
        **/

        // This acceses the orders node, and within that list the correct JSON object, and then changes the status node based off of the value of
        // the status select element.
        this._data.orders[index].status = this._elements[index].status.selectedIndex;

        // Converting the JSON to a string for storage in bound column.
        this._stringData = JSON.stringify(this._data);

        // Notifies the system that an output has changed and it's time to call getOutputs()
        this._notifyOutputChanged();
    }

    /*
    This function adds a change order to the _data JSON structure and the _elements list
    */
    public addChangeOrder(evt: Event): void {

        // Creating a temporary Order JSON object
        let newOrder: Order = {
            amount: 0,
            status: 0
        };

        // Appending the new order to the _data JSON orders node
        this._data.orders.push(newOrder);

        // Creating the neccessary temporary elements and storing them in something called newOrderElements
        let newOrderElements: changeOrderDisplay = this.createTempElements(this._data.orders.length-1);

        // Appending the elements to the _elements attribute
        this._elements.push(newOrderElements);

        // Then attaching it to the dom
        this._container.appendChild(newOrderElements.div);

        // Stringifying the _data attribute
        this._stringData = JSON.stringify(this._data);

        // Notifying system of change
        this._notifyOutputChanged();
        
    }

    /*
    This event handler removes a change order when its attached element is clicked.
    */
    public removeChangeOrder(element: changeOrderDisplay, evt: Event): void {

        // Because these are json objects you have to find the index of the objects in _elements by a unique property in the JSON object. In this case 
        // the map function is used to compare the div of the passed "element" to each object's div in _elements
        let index = this._elements.map(e => e.div).indexOf(element.div);

        // Removing the JSON object from the _data orders node that holds the data for a change order.
        this._data.orders.splice(index, 1);

        // Removing the elements from the DOM
        this._elements[index].div.remove();

        // Removing the JSON object from the _elements list that holds the change order's elements.
        this._elements.splice(index, 1);



        // Stringifying _data JSON object for storage.
        this._stringData = JSON.stringify(this._data);

        // Notifying the sytem that the output has changed.
        this._notifyOutputChanged();

    }

    /*
    This function will create all the needed temporary Elements and return a changeOrderDisplay JSON object
    */
    public createTempElements(changeOrder: number): changeOrderDisplay {

        // Temporary variables that aren't object attributes to hold Name element, Amount element, Status element, and the div to hold each.
        let tempName = document.createElement("label");
        let tempAmount = document.createElement("input");
        let tempStatus = document.createElement("select");
        let tempDiv = document.createElement("div");
        let tempDelete = document.createElement("input");

        // Setting types for input elements
        tempAmount.setAttribute("type", "number");
        tempDelete.setAttribute("type", "submit");

        // Setting names for input elements of type submit
        tempDelete.setAttribute("value", "X");
        
        // Creating and appending the choices for the Status element
        tempStatus.appendChild(document.createElement("option")).innerHTML = "Pending";
        tempStatus.appendChild(document.createElement("option")).innerHTML = "Accepted";
        tempStatus.appendChild(document.createElement("option")).innerHTML = "Rejected";


        // Setting the classes of each element for styling
        tempName.className = "labelTitleElement children";
        tempAmount.className = "inputAmountElement children";
        tempStatus.className = "inputStatusElement children";
        tempDelete.className = "deleteChangeOrder children";
        tempDiv.className = "changeOrderDiv";


        // Appending all the temporary elements to the temporary div
        tempDiv.appendChild(tempName);
        tempDiv.appendChild(tempAmount);
        tempDiv.appendChild(tempStatus);
        tempDiv.appendChild(tempDelete);

        /*
        This is a temporary object of the div, name, amount, status, and delete elements that will be passed to 
        refreshAmount, refreshStatus, and removeChangeOrder to allow these functions to search the _elements list 
        and find the correct and current index of these elements in the _data JSON object and _elements list.
        */
        let tempObject: changeOrderDisplay = {
            div: tempDiv,
            name: tempName,
            amount: tempAmount,
            status: tempStatus,
            delete: tempDelete

        }

        // Binding event listeners and passing arguments 
        tempStatus.addEventListener("input", this.refreshStatus.bind(this, tempObject));
        tempAmount.addEventListener("input", this.refreshAmount.bind(this, tempObject));
        tempDelete.addEventListener("click", this.removeChangeOrder.bind(this, tempObject));

        return tempObject;
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void
    {
        // Add code to update control view
        
        // Setting the attribute context as the page context
        this._context = context;

        // Setting the heading of the control
        this.labelElement.innerHTML = "<b>CHANGE ORDERS</b>";
        
        // If there are elements this sets their values
        if (this._elements.length > 0) {
            this._elements.forEach(element => {

                let index: number = this._elements.indexOf(element); 

                // Sets the label for each change order to the index + 1, not just the index because
                // it would start at 0.
                element.name.innerHTML = `CO-${index+1}`;

                // Sets the value of the amount element to be the same as the the amount node in the _data JSON object 
                element.amount.setAttribute("value", String(this._data.orders[index].amount));

                // Sets the selected value of the element to be that of the status node in the _data JSON object
                element.status.selectedIndex = this._data.orders[index].status;

            })
        } 

        // If there are no elements this notifies the user
        else {
            this.labelElement.innerHTML = "<b>CHANGE ORDERS:</b>  \nNo change Orders Currently!";
        }


        }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs
    {
        return {
            OutputField: this._stringData,
        };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void
    {
        // Add code to cleanup control if necessary
    }
}
