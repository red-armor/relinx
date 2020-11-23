import React, { useCallback } from "react";
import ReactDOM from "react-dom";
import { Provider, useDispatch, createStore, observe, applyMiddleware, useRelinx } from 'relinx'

const A = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean",
  "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive",
  "cheap", "expensive", "fancy"];
const C = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
const N = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse",
  "keyboard"];

const random = (max) => Math.round(Math.random() * 1000) % max;

let nextId = 1;
function buildData(count) {
  const data = new Array(count);
  for (let i = 0; i < count; i++) {
    data[i] = {
      id: nextId++,
      label: `${A[random(A.length)]} ${C[random(C.length)]} ${N[random(N.length)]}`,
      selected: false,
    }
  }
  return data;
}

const bench = () => ({
  state: {
    data: [],
    // selected: 0,
  },
  reducers: {
    "RUN": () => {
      const data = buildData(1000)
      data[0].selected = true
      return { data };
    },
    "RUN_LOTS": () => {
      const data = buildData(10000)
      data[0].selected = true
      return { data };
    },
    "ADD": (state) => {
      const { data } = state
      return { data: data.concat(buildData(1000)) };
    },
    "UPDATE": (state) => {
      const { data } = state
      const newData = data.slice();
      for (let i = 0; i < newData.length; i += 10) {
        const r = newData[i];
        newData[i] = { id: r.id, label: r.label + " !!!", selected: r.selected };
      }

      return { data: newData };
    },
    "REMOVE": (state, payload) => {
      const { data } = state
      const newData = data.slice();
      const index = data.findIndex(({ id }) => id === payload.id)
      newData.splice(index, 1);
      return { data: newData };
    },
    "SELECT": (state, payload) => {
      const { data } = state
      const index = data.findIndex(({ id }) => id === payload.id)
      const selectedIndex = data.findIndex(({ selected }) => selected)

      const newData = data.slice()
      newData[selectedIndex] = { ...newData[selectedIndex], selected: false }
      newData[index] = { ...newData[index], selected: true }

      return {
        data: newData
      }
      // return { data, selected: payload.id };
    },
    "CLEAR": () => {
      return { data: [] };
    },
    "SWAP_ROWS": (state) => {
      const { data } = state
      const newData = data.slice();
      const tmp = newData[1];
      newData[1] = newData[998];
      newData[998] = tmp;

      return { data: newData };
    },
    setProps: (_, payload) => ({ ...payload })
  }
})


const Module = () => {
  const result = {
    BENCH: bench(),
  }
  return result
}

const store = createStore(
  {
    models: Module(),
  },
  applyMiddleware()
)

// const GlyphIcon = <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>;

const RowInner = ({ data }) => {
  const [dispatch] = useDispatch()
  const select = () => {
    dispatch({ type: "BENCH/SELECT", payload: { id: data.id } })
  };

  console.log('update ', data.id)

  const remove = () => { dispatch({ type: "BENCH/REMOVE", payload: { id: data.id } }); };
  return (
    <tr className={data.selected ? "danger" : ""}>
      <td className="col-md-1">{data.id}</td>
      <td className="col-md-4"><a onClick={select}>{data.label}</a></td>
      <td className="col-md-1"><a onClick={remove}>x</a></td>
      <td className="col-md-6"></td>
    </tr>
  )
}

const Row = observe(RowInner)
// const Row = observe(React.memo(props => <RowInner {...props}/>))
// const Row = observe(React.memo(props => <RowInner {...props} />))
// const Row = observe(React.memo(props => <RowInner {...props} />, (prev, next) => {
//   // console.log('pve ', prev.data === next.data)
//   return prev.data === next.data
// }))

const RowListInner = () => {
  const [state] = useRelinx('BENCH')
  const rows = state.data
  return rows.map((data) => {
    return <Row key={data.id} data={data} />
  });
}
const RowList = observe(RowListInner)

const Button = React.memo(({ id, title, cb }) => (
  <div className="col-sm-6 smallpad">
    <button type="button" className="btn btn-primary btn-block" id={id} onClick={cb}>{title}</button>
  </div>
));

const MainInner = () => {
  const [dispatch] = useDispatch()
  const run = useCallback(() => { dispatch({ type: "BENCH/RUN" }); }, []);
  const runLots = useCallback(() => { dispatch({ type: "BENCH/RUN_LOTS" }); }, []);
  const add = useCallback(() => { dispatch({ type: "BENCH/ADD" }); }, []);
  const update = useCallback(() => { dispatch({ type: "BENCH/UPDATE" }); }, []);
  const clear = useCallback(() => { dispatch({ type: "BENCH/CLEAR" }); }, []);
  const swapRows = useCallback(() => { dispatch({ type: "BENCH/SWAP_ROWS" }); }, []);
  return (
    <div className="container">
      <div className="jumbotron">
        <div className="row">
          <div className="col-md-6"><h1>React + Relinx</h1></div>
          <div className="col-md-6"><div className="row">
            <Button id="run" title="Create 1,000 rows" cb={run} />
            <Button id="runlots" title="Create 10,000 rows" cb={runLots} />
            <Button id="add" title="Append 1,000 rows" cb={add} />
            <Button id="update" title="Update every 10th row" cb={update} />
            <Button id="clear" title="Clear" cb={clear} />
            <Button id="swaprows" title="Swap Rows" cb={swapRows} />
          </div></div>
        </div>
      </div>
      <table className="table table-hover table-striped test-data"><tbody><RowList /></tbody></table>
      <span className="preloadicon glyphicon glyphicon-remove" aria-hidden="true"></span>
    </div>
  );
};

const Main = observe(MainInner)

ReactDOM.render(
  <Provider store={store}><Main /></Provider>,
  document.getElementById("main")
);
