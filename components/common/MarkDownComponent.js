const MarkDownComponent = {
  a: (props) => {
    const { node, ...rest } = props;
    return (
      <a
        {...rest}
        className="text-blue-500"
        target="_blank"
        rel="noopener noreferrer"
      />
    );
  },
  p: (props) => {
    const { node, ...rest } = props;
    return <p {...rest} />;
  },
  em: (props) => {
    const { node, ...rest } = props;
    return <i {...rest} />;
  },
  li: (props) => {
    const { node, ...rest } = props;
    return <li {...rest} />;
  },
};

export default MarkDownComponent;
