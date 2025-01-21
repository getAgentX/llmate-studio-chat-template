import { createReactBlockSpec } from "@blocknote/react";
import DatasourceOutput from "../Components/DatasourceOutput";

export const DatasourceBotBlock = createReactBlockSpec(
  {
    type: "sql_datasource_run",
    propSchema: {
      data: {
        event_id: "",
        datasource_run_id: "",
        datasource_id: "",
        data_visualization_config: {},
        sql_cmd: "",
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      const handleConfig = (data) => {
        const prevData = props.block.props.data;

        props.editor.updateBlock(props.block.id, {
          props: {
            data: {
              ...prevData,
              data_visualization_config: data,
            },
          },
        });
      };

      return (
        <DatasourceOutput
          {...props.block.props.data}
          handleConfig={handleConfig}
          block_id={props.block.id}
        />
      );
    },
  }
);
