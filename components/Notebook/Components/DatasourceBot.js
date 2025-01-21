import React, { useEffect } from "react";

const DatasourceBot = ({ props, data }) => {
  // const handleSave = () => {
  //   console.log("props.block.id", props.block.id);

  //   props.editor.updateBlock(props.block.id, {
  //     props: { data: datasourceContextData },
  //   });
  // };

  // useEffect(() => {
  //   console.log("Hello");
  //   handleSave();
  // }, [handleDatasourceSetContext]);

  return (
    <div className="flex flex-col w-full h-full bg-[#181A1C] border border-[#303238] rounded-md p-2 text-sm leading-6 text-white/40 font-normal tracking-wider">
      Query your datasource on the right and add the generated response, which
      will be displayed here.
    </div>
  );
};

export default DatasourceBot;
