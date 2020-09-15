import { Collections, Action } from './types';

class GlobalHelper {
  public collections: Collections;
  constructor() {
    this.collections = [];
  }

  addAction(actionKey: string, namespace: string, actions: Array<Action>) {
    this.collections.push({
      actionKey,
      namespace,
      remover: () => {
        const index = this.collections.findIndex(
          ({ actionKey: key }) => key === actionKey
        );
        if (index !== -1) this.collections.splice(index, 1);
      },
      actions,
    });
  }
}

export default new GlobalHelper();
