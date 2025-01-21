import React, { useState, useCallback, useRef } from "react";
import _ from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useDashboardContext } from "@/context/DashboardContext";
import { useUpdateWidgetsPositionMutation } from "@/store/dashboard";
import WidgetEmbedRender from "./WidgetEmbedRender";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const getInitialLayout = (widgets) =>
  widgets.map((widget) => ({
    i: widget.id,
    x: widget.position?.x || 0,
    y: widget.position?.y || 0,
    w: widget.position?.w || 2,
    h: widget.position?.h || 4,
    // minH: 4, // Uncomment if minimum height is needed
  }));

const DashboardEmbedSection = ({ data, dashboard_id, onSectionRefresh }) => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");
  const [mounted, setMounted] = useState(false);
  const [layouts, setLayouts] = useState(false);
  const [firstRender, setFirstRender] = useState(false);

  const { setShowAddWidget, setCurrentOutput } = useDashboardContext();
  const [updateWidgetsPosition, { data: updateData, isLoading }] =
    useUpdateWidgetsPositionMutation();

  const contentRefs = useRef({});

  // Handle breakpoint changes
  const onBreakpointChange = useCallback((breakpoint) => {
    setCurrentBreakpoint(breakpoint);
  }, []);

  // Handle layout changes
  const onLayoutChange = useCallback(
    (layout, allLayouts) => {
      setLayouts(allLayouts);

      // Prepare payload for updating widget positions

      if (firstRender) {
        setFirstRender(false);
        return;
      }

      const payload = layout.reduce((acc, item) => {
        acc[item.i] = {
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        };
        return acc;
      }, {});

      setCurrentOutput(payload);
      updateWidgetsPosition({
        dashboard_id,
        section_id: data.id,
        payload,
      });
    },
    [dashboard_id, data.id, setCurrentOutput, updateWidgetsPosition]
  );

  // Adjust widget height based on content
  const adjustHeightBasedOnContent = useCallback(
    (id) => {
      const contentHeight = contentRefs.current[id]?.clientHeight;
      const rowHeight = 70; // Must match the grid's rowHeight
      const calculatedHeight = Math.ceil(contentHeight / rowHeight);

      setLayouts((prevLayouts) => {
        if (!prevLayouts) return prevLayouts;
        const updatedLayout = prevLayouts[currentBreakpoint].map((layout) =>
          layout.i === id ? { ...layout, h: calculatedHeight } : layout
        );
        return { ...prevLayouts, [currentBreakpoint]: updatedLayout };
      });
    },
    [currentBreakpoint]
  );

  // Generate grid items
  const generateDOM = () => {
    if (data.widgets.length === 0) {
      return (
        <div className="flex items-center justify-center w-full h-full text-xs font-medium text-white ">
          <button
            type="button"
            className="flex items-center space-x-2 hover:text-white group"
            onClick={() => setShowAddWidget(true)}
          >
            <span>
              <svg
                viewBox="0 0 15 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 fill-white/50 group-hover:fill-white"
              >
                <path d="M6.5 8H0.5V6H6.5V0H8.5V6H14.5V8H8.5V14H6.5V8Z" />
              </svg>
            </span>
            <span>Add Widget</span>
          </button>
        </div>
      );
    }

    return data.widgets.map((widgetItem) => (
      <div
        key={widgetItem.id}
        className="bg-[#181818] text-white rounded-md "
        ref={(el) => (contentRefs.current[widgetItem.id] = el)}
        onLoad={() => adjustHeightBasedOnContent(widgetItem.id)}
      >
        <div className="w-full h-full">
          <WidgetEmbedRender
            dashboard_id={dashboard_id}
            section_id={data.id}
            widgetData={widgetItem}
            onWidgetRefresh={onSectionRefresh}
          />
        </div>
      </div>
    ));
  };

  if (data.widgets.length === 0) {
    return (
      <div className="flex-1 h-full px-4 py-4">
        <div className="flex flex-col items-center justify-center w-full h-full mx-auto border rounded-md border-border-color bg-secondary-bg">
          <span className="flex items-center justify-center w-10 h-10 bg-[#2A5485] rounded-md">
            <svg
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 fill-white"
            >
              <path d="M24.65 20.9992L19 15.3492L24.65 9.69922L30.3 15.3492L24.65 20.9992ZM11 18.9992V10.9992H19V18.9992H11ZM21 28.9992V20.9992H29V28.9992H21ZM11 28.9992V20.9992H19V28.9992H11Z" />
            </svg>
          </span>

          <p className="mt-2 text-lg font-medium text-primary-text">
            No Data Available to Display
          </p>

          <p className="w-full max-w-lg mx-auto text-base font-normal text-center text-secondary-text">
            The section is set up, but no data has been added yet, so nothing is
            showing right now.
          </p>
        </div>
      </div>
    );
  }

  const initialLayout = getInitialLayout(data.widgets);

  return (
    <div className="w-full min-h-full rounded-md bg-page-light ">
      <ResponsiveReactGridLayout
        className="layout"
        layouts={{
          lg: initialLayout,
          md: initialLayout,
          sm: initialLayout,
          xs: initialLayout,
          xxs: initialLayout,
        }}
        onBreakpointChange={onBreakpointChange}
        onLayoutChange={onLayoutChange}
        measureBeforeMount={false}
        useCSSTransforms={mounted}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 6, xs: 2, xxs: 1 }}
        rowHeight={70}
      >
        {generateDOM()}
      </ResponsiveReactGridLayout>
    </div>
  );
};

export default DashboardEmbedSection;
