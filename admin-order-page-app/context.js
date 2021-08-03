const OrdersContext = React.createContext([]);

const useOrdersContext = () => {
    React.useContext(OrdersContext)

    const [orders, setOrders] = React.useContext(OrdersContext);
 
    const handleOrders = value => setOrders(value);
    
    return { value: orders, onChange: handleOrders };
}

const OrdersProvider = ({ children }) => {
    
    const [orders, setOrders] = React.useState([]);

    return (
      <OrdersContext.Provider value={[orders, setOrders]}>
        {children}
      </OrdersContext.Provider>
    );
  };

export { OrdersProvider, useOrdersContext };
