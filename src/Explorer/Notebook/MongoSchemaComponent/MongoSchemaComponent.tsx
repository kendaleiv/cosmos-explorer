import * as React from "react";
import { Dispatch } from "redux";
import { PrimaryButton, Stack } from "office-ui-fabric-react";
import { KernelOutputError, Output, StreamText } from "@nteract/outputs";
import TransformMedia from "@nteract/stateful-components/lib/outputs/transform-media";
import { actions, selectors, AppState, ContentRef, KernelRef } from "@nteract/core";
import loadTransform from "../NotebookComponent/loadTransform";
import { connect } from "react-redux";
import "./MongoSchemaComponent.less";
import Immutable from "immutable";
import { Card } from "@uifabric/react-cards";

interface MongoSchemaComponentPureProps {
  contentRef: ContentRef;
  kernelRef: KernelRef;
  databaseId: string;
  collectionId: string;
}

interface MongoSchemaComponentDispatchProps {
  runCell: (contentRef: ContentRef, cellId: string) => void;
  addTransform: (transform: React.ComponentType & { MIMETYPE: string }) => void;
  updateCell: (text: string, id: string, contentRef: ContentRef) => void;
}

type OutputType = "rich" | "json";

interface MongoSchemaComponentState {
  outputType: OutputType;
}

type MongoSchemaComponentProps = MongoSchemaComponentPureProps & StateProps & MongoSchemaComponentDispatchProps;

export class MongoSchemaComponent extends React.Component<MongoSchemaComponentProps, MongoSchemaComponentState> {
  constructor(props: MongoSchemaComponentProps) {
    super(props);
    this.state = {
      outputType: "rich",
    };
  }

  componentDidMount(): void {
    loadTransform(this.props);
  }

  private onAnalyzeSchema = () => {
    const query = {
      command: "listSchema",
      database: this.props.databaseId,
      collection: this.props.collectionId,
      outputType: this.state.outputType,
    };

    this.props.updateCell(JSON.stringify(query), this.props.firstCellId, this.props.contentRef);
    this.props.runCell(this.props.contentRef, this.props.firstCellId);
  };

  render(): JSX.Element {
    const { firstCellId: id, contentRef, kernelStatus, outputs } = this.props;

    if (!id) {
      return <></>;
    }

    const isKernelBusy = kernelStatus === "busy";
    return (
      <div className="mongoSchemaComponent">
        <PrimaryButton
          text={isKernelBusy ? "Analyzing..." : "Analyze"}
          onClick={this.onAnalyzeSchema}
          disabled={isKernelBusy}
        />

        <Stack className="mongoSchemaOuput" tokens={{ childrenGap: 20 }}>
          {outputs.map((output, index) => (
            <Card className="mongoSchemaCard" key={index}>
              <Card.Item tokens={{ padding: 10 }}>
                <Output output={output}>
                  <TransformMedia output_type={"display_data"} id={id} contentRef={contentRef} />
                  <TransformMedia output_type={"execute_result"} id={id} contentRef={contentRef} />
                  <KernelOutputError />
                  <StreamText />
                </Output>
              </Card.Item>
            </Card>
          ))}
        </Stack>
      </div>
    );
  }
}

interface StateProps {
  firstCellId: string;
  kernelStatus: string;
  outputs: Immutable.List<any>;
}

interface InitialProps {
  kernelRef: string;
  contentRef: string;
}

// Redux
const makeMapStateToProps = (state: AppState, initialProps: InitialProps) => {
  const { kernelRef, contentRef } = initialProps;
  const mapStateToProps = (state: AppState) => {
    let kernelStatus;
    let firstCellId;
    let outputs;

    const kernel = selectors.kernel(state, { kernelRef });
    if (kernel) {
      kernelStatus = kernel.status;
    }

    const content = selectors.content(state, { contentRef });
    if (content?.type === "notebook") {
      const cellOrder = selectors.notebook.cellOrder(content.model);
      if (cellOrder.size > 0) {
        firstCellId = cellOrder.first() as string;

        const model = selectors.model(state, { contentRef });
        if (model && model.type === "notebook") {
          const cell = selectors.notebook.cellById(model, { id: firstCellId });
          if (cell) {
            outputs = cell.get("outputs", Immutable.List());
          }
        }
      }
    }

    return {
      firstCellId,
      kernelStatus,
      outputs,
    };
  };
  return mapStateToProps;
};

const makeMapDispatchToProps = (initialDispatch: Dispatch, initialProps: MongoSchemaComponentProps) => {
  const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
      addTransform: (transform: React.ComponentType & { MIMETYPE: string }) => {
        return dispatch(
          actions.addTransform({
            mediaType: transform.MIMETYPE,
            component: transform,
          })
        );
      },
      runCell: (contentRef: ContentRef, cellId: string) => {
        return dispatch(
          actions.executeCell({
            contentRef,
            id: cellId,
          })
        );
      },
      updateCell: (text: string, id: string, contentRef: ContentRef) => {
        dispatch(actions.updateCellSource({ id, contentRef, value: text }));
      },
    };
  };
  return mapDispatchToProps;
};

export default connect(makeMapStateToProps, makeMapDispatchToProps)(MongoSchemaComponent);
