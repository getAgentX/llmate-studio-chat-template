import { createReactBlockSpec } from "@blocknote/react";
import AssistantOutput from "../Components/AssistantOutput";

export const AssistantBotBlock = createReactBlockSpec(
  {
    type: "chatbot_sql_datasource_run",
    propSchema: {
      data: {
        chat_id: "",
        assistant_id: "",
        event_id: "",
        message_id: "",
        data_visualization_config: {},
        sql_cmd: "",
        datasource_id: "",
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
        <AssistantOutput
          {...props.block.props.data}
          handleConfig={handleConfig}
          block_id={props.block.id}
        />
      );
    },
  }
);
