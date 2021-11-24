import React, { useCallback } from "react";
import ReactDOM from "react-dom";
import { Provider, useDispatch, createStore, observe, applyMiddleware, useRelinx } from 'relinx'

const A = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean",
  "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive",
  "cheap", "expensive", "fancy"];
const C = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
const N = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse",
  "keyboard"];

const random = (max) => Math.round(Math.random() * 10) % max;

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
    selected: 0,
  },
  reducers: {
    "RUN": () => {
      return { data: buildData(10), selected: 0 };
    },
    "RUN_LOTS": () => {
      return { data: buildData(100), selected: 0 };
    },
    "ADD": (state) => {
      return { data: state.data.concat(buildData(10)), selected: state.selected };
    },
    "UPDATE": (state) => {
      const newData = state.data.slice();
      for (let i = 0; i < newData.length; i += 10) {
        const r = newData[i];
        newData[i] = { id: r.id, label: r.label + " !!!" };
      }
      return { data: newData, selected: state.selected };
    },
    "REMOVE": (state, payload) => {
      const idx = state.data.findIndex((d) => d.id === payload.id);
      return { data: [...state.data.slice(0, idx), ...state.data.slice(idx + 1)], selected: state.selected };
    },
    "SELECT": (state, payload) => {
      return { data: state.data, selected: payload.id };
    },
    "CLEAR": () => {
      return { data: [] };
    },
    "SWAP_ROWS": (state) => {
      const newData = state.data.slice();
      const len = newData.length
      const tmp = newData[1];
      newData[1] = newData[len - 1];
      newData[len - 1] = tmp;
      return { data: newData, selected: state.selected };
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

const GlyphIcon = <span className="glyphicon glyphicon-remove" aria-hidden="true">x</span>;

const itemScreenshot = {}
const RowInner = ({ data, isSelected }) => {
  const [dispatch] = useDispatch()
  const select = () => {
    dispatch({ type: "BENCH/SELECT", payload: { id: data.id } })
  };

  console.log('[rerender reason] ', itemScreenshot)

  const remove = () => { dispatch({ type: "BENCH/REMOVE", payload: { id: data.id } }); };
  return (
    <tr className={isSelected ? "danger" : ""}>
      <td className="col-md-1">{data.id}</td>
      <td className="col-md-4"><a onClick={select}>{data.label}</a></td>
      <td className="col-md-1"><a onClick={remove}>{GlyphIcon}</a></td>
      <td className="col-md-6"></td>
    </tr>
  )
}
const Row = observe(RowInner, {
  falsyScreenShot: itemScreenshot
})

const listScreenshot = {}

const RowListInner = () => {
  const [state] = useRelinx('BENCH')
  const { selected } = state
  const rows = state.data

  console.log('[rerender reason] ', listScreenshot)

  return rows.map((data, index) => {
    return <Row key={data.id} data={data} isSelected={selected === data.id}/>
  });
}
const RowList = observe(RowListInner, {
  falsyScreenShot: listScreenshot,
  listener: token => {
    console.log('[log rerender action] ', token)
  }
})

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
  <Provider store={store} shouldLogRerender><Main /></Provider>,
  document.getElementById("main")
);
